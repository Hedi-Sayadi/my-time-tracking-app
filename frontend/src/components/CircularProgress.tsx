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
  const clamped = Math.min(value, 100);
  // SVG circles start at 3 o'clock; shift by 25% to start at 12 o'clock
  const offset = circumference * 0.75 - (clamped / 100) * circumference;

  let colorClass = styles.blue;
  if (value >= 80 && value <= 100) colorClass = styles.orange;
  if (value > 100) colorClass = styles.green;

  return (
    <div className={styles.progressRing}>
      <div className={styles.svgWrapper} style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          <circle className={styles.track} cx={size / 2} cy={size / 2} r={radius} />
          <circle
            className={`${styles.indicator} ${colorClass}`}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className={styles.percentage}>{Math.round(value)}%</div>
      </div>
      <div className={styles.label}>
        <div className={styles.value}>{label}</div>
        <div>{sublabel}</div>
      </div>
    </div>
  );
};

export default CircularProgress;
