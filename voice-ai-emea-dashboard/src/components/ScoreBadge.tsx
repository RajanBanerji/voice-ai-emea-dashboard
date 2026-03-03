import React from 'react';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, size = 'md' }) => {
  const getColor = (s: number): string => {
    if (s >= 8) return '#10B981';
    if (s >= 6) return '#F59E0B';
    return '#EF4444';
  };

  const getSizeClasses = (): string => {
    switch (size) {
      case 'lg':
        return 'px-4 py-2 text-5xl font-bold'; // ~48px
      case 'md':
        return 'px-3 py-1 text-2xl font-semibold'; // ~24px
      case 'sm':
        return 'px-2 py-0.5 text-sm font-medium'; // ~14px
      default:
        return 'px-3 py-1 text-2xl font-semibold';
    }
  };

  const color = getColor(score);

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full ${getSizeClasses()}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      {score.toFixed(1)}
    </span>
  );
};

export default ScoreBadge;
