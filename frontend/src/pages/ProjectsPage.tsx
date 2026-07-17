import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject, type Project } from '../api/projects';

function ProjectItem({
  project,
  depth,
  allProjects,
  onEdit,
}: {
  project: Project;
  depth: number;
  allProjects: Project[];
  onEdit: (p: Project) => void;
}) {
  const deleteProject = useDeleteProject();
  const navigate = useNavigate();
  const subprojects = allProjects.filter((p) => p.parentId === project.id);

  return (
    <div className="project-item" style={{ marginLeft: depth * 20 }}>
      <article className="task-row">
        <div>
          <strong>{project.name}</strong>
          {project.description && <p>{project.description}</p>}
        </div>
        <div className="row-actions">
          <button
            type="button"
            className="primary-button small"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            View
          </button>
          <button type="button" className="secondary-button small" onClick={() => onEdit(project)}>
            Edit
          </button>
          <button
            type="button"
            className="danger-button small"
            onClick={() => {
              if (confirm(`Delete "${project.name}"? Subprojects will be reassigned.`)) {
                deleteProject.mutate(project.id);
              }
            }}
            disabled={deleteProject.isPending}
          >
            Delete
          </button>
        </div>
      </article>
      {subprojects.map((sub) => (
        <ProjectItem key={sub.id} project={sub} depth={depth + 1} allProjects={allProjects} onEdit={onEdit} />
      ))}
    </div>
  );
}

function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [error, setError] = useState('');

  const rootProjects = projects?.filter((p) => p.parentId === null) ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
      parentId: parentId ? Number(parentId) : undefined,
    };

    try {
      if (editing) {
        await updateProject.mutateAsync({ id: editing.id, data });
      } else {
        await createProject.mutateAsync(data);
      }
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save project');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setName('');
    setDescription('');
    setParentId('');
    setError('');
  };

  const handleEdit = (project: Project) => {
    setEditing(project);
    setName(project.name);
    setDescription(project.description || '');
    setParentId(project.parentId?.toString() ?? '');
    setShowForm(true);
  };

  return (
    <section className="page-stack">
      <header className="page-header">
        <p className="eyebrow">Projects</p>
        <h1>Keep your lectures, seminars, and side work in one place.</h1>
      </header>

      <div className="page-actions">
        <button type="button" className="primary-button" onClick={() => { resetForm(); setShowForm(true); }}>
          New project
        </button>
      </div>

      {showForm && (
        <article className="panel">
          <h2>{editing ? 'Edit project' : 'New project'}</h2>
          <form className="task-form" onSubmit={handleSubmit}>
            {error && <p className="error">{error}</p>}
            <label>
              Name
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              Description
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <label>
              Parent project (optional)
              <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
                <option value="">None</option>
                {projects
                  ?.filter((p) => p.id !== editing?.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </label>
            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={createProject.isPending || updateProject.isPending}>
                {editing ? 'Update' : 'Create'}
              </button>
              <button type="button" className="secondary-button" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </article>
      )}

      <article className="panel">
        <h2>Project overview</h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : rootProjects.length === 0 ? (
          <p>No projects yet. Create one to get started.</p>
        ) : (
          <div className="project-list">
            {rootProjects.map((project) => (
              <ProjectItem key={project.id} project={project} depth={0} allProjects={projects ?? []} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </article>
    </section>
  );
}

export default ProjectsPage;
