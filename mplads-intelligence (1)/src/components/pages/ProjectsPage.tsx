import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Project, MaharashtraDistrict, ProjectCategory, RiskLevel, ProjectStatus } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { StatusBadge } from '../common/StatusBadge';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const {
    currentRole,
    getFilteredProjectsForRole,
    navigateToProject,
    setSelectedProjectId,
    showToast,
  } = useApp();

  const allProjects = getFilteredProjectsForRole();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [sortField, setSortField] = useState<'riskScore' | 'sanctionedAmount' | 'expenditure' | 'physicalProgress' | 'delayDays'>('riskScore');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const itemsPerPage = 8;

  // Filter & Sort Logic
  const filteredProjects = useMemo(() => {
    return allProjects
      .filter((p) => {
        const matchesSearch =
          p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.implementingAgency.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.district.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDistrict = selectedDistrict === 'ALL' || p.district === selectedDistrict;
        const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
        const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
        const matchesRisk = selectedRisk === 'ALL' || p.riskLevel === selectedRisk;

        return matchesSearch && matchesDistrict && matchesCategory && matchesStatus && matchesRisk;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (sortOrder === 'desc') {
          return valB > valA ? 1 : -1;
        } else {
          return valA > valB ? 1 : -1;
        }
      });
  }, [
    allProjects,
    searchTerm,
    selectedDistrict,
    selectedCategory,
    selectedStatus,
    selectedRisk,
    sortField,
    sortOrder,
  ]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage) || 1;
  const paginatedProjects = filteredProjects.slice(
    (currentPageNum - 1) * itemsPerPage,
    currentPageNum * itemsPerPage
  );

  const handleRowClick = (id: string) => {
    setSelectedProjectId(id);
    navigateToProject(id);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedRisk('ALL');
    setSelectedDistrict('ALL');
    setSelectedCategory('ALL');
    setSelectedStatus('ALL');
    setCurrentPageNum(1);
  };

  const districtList: MaharashtraDistrict[] = [
    'Pune',
    'Thane',
    'Nagpur',
    'Nashik',
    'Ratnagiri',
    'Kolhapur',
    'Chhatrapati Sambhajinagar',
    'Mumbai',
    'Raigad',
    'Satara',
  ];

  const categoryList: ProjectCategory[] = [
    'Healthcare',
    'Drinking Water',
    'Road Development',
    'Community Hall',
    'School Infrastructure',
    'Sanitation',
    'Street Lighting',
    'Public Infrastructure',
  ];

  const hasActiveAdvancedFilters =
    selectedDistrict !== 'ALL' || selectedCategory !== 'ALL' || selectedStatus !== 'ALL';

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Banner & Header */}
      <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#002D62] tracking-tight">
            {currentRole === 'DISTRICT_AUTHORITY' ? 'My District Projects' : 'Projects Directory'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Overview of monitored MPLADS development works and their risk assessments.
          </p>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong className="text-[#002D62]">{filteredProjects.length}</strong> of {allProjects.length} projects
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPageNum(1);
              }}
              placeholder="Search by project name, district, ID..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#002D62] focus:border-[#002D62] text-slate-900"
            />
          </div>

          {/* Quick Risk Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-400 mr-1 text-xs">Risk:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'CRITICAL', label: 'Critical' },
              { id: 'HIGH', label: 'High' },
              { id: 'MEDIUM', label: 'Medium' },
              { id: 'LOW', label: 'Low' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedRisk(r.id);
                  setCurrentPageNum(1);
                }}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  selectedRisk === r.id
                    ? 'bg-[#002D62] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}

            {/* Toggle More Filters */}
            <button
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`ml-2 px-3 py-1.5 rounded-md border flex items-center gap-1.5 transition-colors ${
                showMoreFilters || hasActiveAdvancedFilters
                  ? 'border-[#002D62] text-[#002D62] bg-blue-50/50'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>More Filters</span>
              {showMoreFilters ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable More Filters Tray */}
        {showMoreFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* District Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setCurrentPageNum(1);
                }}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#002D62]"
              >
                <option value="ALL">All Districts</option>
                {districtList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Sector / Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPageNum(1);
                }}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#002D62]"
              >
                <option value="ALL">All Categories</option>
                {categoryList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Project Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPageNum(1);
                }}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#002D62]"
              >
                <option value="ALL">All Statuses</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="In Progress">In Progress</option>
                <option value="Delayed">Delayed</option>
                <option value="Completed">Completed</option>
                <option value="Sanctioned">Sanctioned</option>
              </select>
            </div>
          </div>
        )}

        {/* Active Filters Reset Option */}
        {(searchTerm || selectedRisk !== 'ALL' || hasActiveAdvancedFilters) && (
          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
            <span>Filtering active</span>
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-[#002D62] hover:underline font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Clean, Readable Projects Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[11px] tracking-wider">
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Progress</th>
                <th className="py-3 px-4 text-center">Risk</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedProjects.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No matching projects found. Try resetting filters.
                  </td>
                </tr>
              ) : (
                paginatedProjects.map((p) => {
                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleRowClick(p.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      {/* Project Column */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-bold text-[#002D62] hover:underline">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          {p.id}
                        </div>
                      </td>

                      {/* District Column */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700 whitespace-nowrap">
                        {p.district}
                      </td>

                      {/* Category Column */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap text-xs">
                        {p.category}
                      </td>

                      {/* Progress Column */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-bold text-slate-800 font-mono text-xs">
                            {p.physicalProgress}%
                          </span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                p.physicalProgress >= 80
                                  ? 'bg-emerald-600'
                                  : p.physicalProgress >= 50
                                  ? 'bg-blue-600'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${Math.min(p.physicalProgress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Risk Column */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <RiskBadge level={p.riskLevel} score={p.riskScore} size="md" />
                      </td>

                      {/* Status Column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={p.status} size="sm" />
                      </td>

                      {/* Action Column */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(p.id);
                          }}
                          className="px-3 py-1.5 bg-[#002D62] hover:bg-blue-900 text-white text-xs font-bold rounded shadow-xs transition-colors inline-flex items-center gap-1.5"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3.5 bg-slate-50/60 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing{' '}
            <span className="font-bold text-slate-800">
              {filteredProjects.length === 0
                ? 0
                : (currentPageNum - 1) * itemsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-slate-800">
              {Math.min(currentPageNum * itemsPerPage, filteredProjects.length)}
            </span>{' '}
            of <span className="font-bold text-slate-800">{filteredProjects.length}</span> records
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPageNum((p) => Math.max(p - 1, 1))}
              disabled={currentPageNum === 1}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="font-semibold text-slate-700 font-mono">
              Page {currentPageNum} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPageNum((p) => Math.min(p + 1, totalPages))}
              disabled={currentPageNum === totalPages || totalPages === 0}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
