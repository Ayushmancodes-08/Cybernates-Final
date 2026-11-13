import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  badgeText?: string;
  badgeVariant?: 'info' | 'success' | 'warning' | 'critical';
  trendText?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  badgeText,
  badgeVariant = 'info',
  trendText,
  onClick
}) => {
  let badgeStyles = 'bg-blue-50 text-blue-700 border-blue-200';
  if (badgeVariant === 'success') {
    badgeStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (badgeVariant === 'warning') {
    badgeStyles = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (badgeVariant === 'critical') {
    badgeStyles = 'bg-red-50 text-red-800 border-red-200';
  }

  return (
    <div
      onClick={onClick}
      className={`bg-surface-container-lowest rounded-xl p-5 border border-surface-container shadow-sm flex flex-col justify-between transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/40' : 'hover:shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start">
        <span className="text-xs font-medium text-on-surface-variant tracking-tight">{title}</span>
        {badgeText && (
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider border ${badgeStyles}`}>
            {badgeText}
          </span>
        )}
      </div>

      <div className="my-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-on-surface font-sans">{value}</span>
        {trendText && (
          <span className="text-xs font-mono font-medium text-primary">{trendText}</span>
        )}
      </div>

      <p className="text-xs text-outline line-clamp-1">{subtitle}</p>
    </div>
  );
};
