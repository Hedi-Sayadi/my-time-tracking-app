import React from 'react';
import styles from './CircularProgress.module.css';

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  label: string;
  sublabel: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 120,
  label,
  sublabel,
}) => {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  let colorClass = styles.blue;
  if (value >= 80 && value <= 100) colorClass = styles.orange;
  if (value > 100) colorClass = styles.green;

  return (
    <div className={styles.progressRing}>
      <svg width={size} height={size} className={styles.svg}>
        <circle
          className={styles.track}
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          className={`${styles.indicator} ${colorClass}`}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <text
          x="50%"
          y="50%"
          dy="0.3em"
          textAnchor="middle"
          fontSize="14"
          fontWeight="600"
          fill="currentColor"
        >
          {Math.round(value)}%
        </text>
      </svg>
      <div className={styles.label}>
        <div className={styles.value}>{label}</div>
        <div>{sublabel}</div>
      </div>
    </div>
  );
};

export default CircularProgress;
