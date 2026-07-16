import { useState } from 'react';
import { useCreateTask, useUpdateTask, type TaskRequest } from '../api/tasks';

interface TaskFormProps {
  initialData?: Partial<TaskRequest> & { id?: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

function TaskForm({ initialData, onSuccess, onCancel }: TaskFormProps) {
  const [description, setDescription] = useState(initialData?.description || '');
  const [startTime, setStartTime] = useState(
    initialData?.startTime ? new Date(initialData.startTime).toISOString().slice(0, 16) : ''
  );
  const [endTime, setEndTime] = useState(
    initialData?.endTime ? new Date(initialData.endTime).toISOString().slice(0, 16) : ''
  );
  const [error, setError] = useState('');

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isEdit = !!initialData?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description || !startTime) {
      setError('Description and start time are required');
      return;
    }

    const data: TaskRequest = {
      description,
      startTime: new Date(startTime).toISOString(),
      endTime: endTime ? new Date(endTime).toISOString() : null,
    };

    try {
      if (isEdit && initialData.id) {
        await updateTask.mutateAsync({ id: initialData.id, data });
      } else {
        await createTask.mutateAsync(data);
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to save task');
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      <label>
        Description
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </label>
      <label>
        Start time
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </label>
      <label>
        End time (optional)
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </label>
      <div className="form-actions">
        <button type="submit" className="primary-button" disabled={createTask.isPending || updateTask.isPending}>
          {isEdit ? 'Update task' : 'Add task'}
        </button>
        {onCancel && (
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;
