import React from 'react';
import { RiskLevel } from '../../types';
import { ShieldAlert, AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  size = 'md',
  showIcon = true,
}) => {
  const getStyles = () => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-600 text-white border-transparent',
          dot: 'bg-white',
          icon: ShieldAlert,
          label: 'Critical',
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-500 text-white border-transparent',
          dot: 'bg-white',
          icon: AlertTriangle,
          label: 'High Risk',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          dot: 'bg-amber-500',
          icon: AlertCircle,
          label: 'Medium',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          dot: 'bg-emerald-600',
          icon: CheckCircle2,
          label: 'Low Risk',
        };
    }
  };

  const style = getStyles();
  const IconComponent = style.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-[11px] px-2.5 py-0.5 gap-1.5',
    lg: 'text-xs px-3 py-1 gap-2 font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${style.bg} ${sizeClasses} font-mono tracking-tight select-none`}
    >
      {showIcon && <IconComponent className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />}
      <span className="font-bold">{style.label}</span>
      {score !== undefined && (
        <span className="ml-1 pl-1 border-l border-current/30 font-bold">
          {score}
        </span>
      )}
    </span>
  );
};
