import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: 'blue' | 'red' | 'amber' | 'emerald' | 'purple' | 'slate';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'blue',
  onClick,
}) => {
  const isRed = accentColor === 'red';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded border border-gray-200 p-3.5 sm:p-4 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-gray-300 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[11px] font-semibold uppercase tracking-wider ${
            isRed ? 'text-red-600' : 'text-gray-400'
          }`}
        >
          {title}
        </span>
        <div
          className={`p-1.5 rounded ${
            isRed
              ? 'bg-red-50 text-red-600'
              : accentColor === 'amber'
              ? 'bg-amber-50 text-amber-600'
              : accentColor === 'emerald'
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-slate-100 text-[#002D62]'
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <div
        className={`text-2xl font-bold mt-1 font-mono tracking-tight ${
          isRed ? 'text-red-600' : 'text-[#002D62]'
        }`}
      >
        {value}
      </div>

      {trend ? (
        <div className="text-[10px] text-gray-500 mt-2 flex items-center">
          <span
            className={`mr-1 font-semibold ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.value}
          </span>{' '}
          {trend.label}
        </div>
      ) : subtitle ? (
        <div
          className={`text-[10px] mt-2 truncate ${
            isRed ? 'text-red-500 font-semibold' : 'text-gray-500'
          }`}
        >
          {subtitle}
        </div>
      ) : null}
    </div>
  );
};
