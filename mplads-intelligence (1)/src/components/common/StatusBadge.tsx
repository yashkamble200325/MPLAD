import React from 'react';
import { ProjectStatus } from '../../types';

interface StatusBadgeProps {
  status: ProjectStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStyle = () => {
    switch (status) {
      case 'Under Investigation':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'Delayed':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'In Progress':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'Sanctioned':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'Halted':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      // For Case Statuses:
      case 'New':
        return 'bg-sky-50 text-sky-800 border-sky-300';
      case 'Assigned':
        return 'bg-indigo-50 text-indigo-800 border-indigo-300';
      case 'Under Review':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'Clarification Requested':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Clarification Received':
        return 'bg-teal-50 text-teal-800 border-teal-300';
      case 'Verified':
        return 'bg-rose-50 text-rose-800 border-rose-300 font-semibold';
      case 'False Positive':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStyle()}`}
    >
      {status}
    </span>
  );
};
