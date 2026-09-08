import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaharashtraDistrict, Project } from '../../types';
import { RiskBadge } from '../common/RiskBadge';
import { StatusBadge } from '../common/StatusBadge';
import { GovDisclaimer } from '../common/GovDisclaimer';
import {
  MapPin,
  Building2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Filter,
  Eye,
  IndianRupee,
} from 'lucide-react';

interface DistrictMapData {
  name: MaharashtraDistrict;
  avgRisk: number;
  criticalCount: number;
  projectCount: number;
  sanctionedLakhs: number;
  expenditureLakhs: number;
  x: number; // Percentage X on interactive coordinate canvas
  y: number; // Percentage Y
}

export const RiskMapPage: React.FC = () => {
  const { projects, navigateToProject } = useApp();

  const [selectedDistrict, setSelectedDistrict] = useState<MaharashtraDistrict>(
    projects.some((p) => p.district === 'Pune')
      ? 'Pune'
      : ((projects[0]?.district as MaharashtraDistrict) || 'Mumbai')
  );
  const [filterMode, setFilterMode] = useState<'ALL' | 'HIGH_RISK'>('ALL');

  const districtData: DistrictMapData[] = [
    { name: 'Pune', avgRisk: 86, criticalCount: 1, projectCount: 3, sanctionedLakhs: 74.0, expenditureLakhs: 99.5, x: 38, y: 55 },
    { name: 'Mumbai', avgRisk: 65, criticalCount: 0, projectCount: 2, sanctionedLakhs: 120.0, expenditureLakhs: 105.0, x: 20, y: 48 },
    { name: 'Thane', avgRisk: 68, criticalCount: 1, projectCount: 2, sanctionedLakhs: 72.0, expenditureLakhs: 88.0, x: 26, y: 42 },
    { name: 'Nashik', avgRisk: 70, criticalCount: 1, projectCount: 2, sanctionedLakhs: 50.0, expenditureLakhs: 64.0, x: 34, y: 32 },
    { name: 'Chhatrapati Sambhajinagar', avgRisk: 56, criticalCount: 1, projectCount: 2, sanctionedLakhs: 55.0, expenditureLakhs: 48.0, x: 50, y: 38 },
    { name: 'Nagpur', avgRisk: 27, criticalCount: 0, projectCount: 2, sanctionedLakhs: 85.0, expenditureLakhs: 71.0, x: 84, y: 22 },
    { name: 'Kolhapur', avgRisk: 75, criticalCount: 1, projectCount: 2, sanctionedLakhs: 44.0, expenditureLakhs: 53.0, x: 39, y: 82 },
    { name: 'Satara', avgRisk: 42, criticalCount: 0, projectCount: 1, sanctionedLakhs: 30.0, expenditureLakhs: 24.0, x: 36, y: 68 },
    { name: 'Ratnagiri', avgRisk: 78, criticalCount: 0, projectCount: 1, sanctionedLakhs: 38.0, expenditureLakhs: 44.0, x: 24, y: 76 },
    { name: 'Raigad', avgRisk: 52, criticalCount: 0, projectCount: 2, sanctionedLakhs: 40.0, expenditureLakhs: 37.0, x: 25, y: 58 },
  ];

  const displayedDistricts = districtData.filter((d) => {
    if (filterMode === 'HIGH_RISK') return d.avgRisk >= 60;
    return true;
  });

  const activeDistrictInfo = districtData.find((d) => d.name === selectedDistrict) || districtData[0];
  const districtProjects = projects.filter((p) => p.district === selectedDistrict);

  return (
    <div className="space-y-3.5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#002D62] tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#002D62]" />
              <span>Maharashtra Geographic Risk & Anomaly Map</span>
            </h2>
            <span className="px-2 py-0.5 text-[10px] bg-blue-50 text-[#002D62] border border-blue-200 rounded font-mono font-semibold">
              District Surveillance
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Geospatial concentration of public works expenditure anomalies across 36 administrative divisions
          </p>
        </div>

        <GovDisclaimer compact />
      </div>

      {/* Map + District Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
        {/* Left: Interactive Map Stage */}
        <div className="lg:col-span-7 bg-white rounded border border-gray-200 p-3.5 sm:p-4 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#002D62]">
              State Risk Heatmap — Interactive Geo-Canvas
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                  filterMode === 'ALL'
                    ? 'bg-[#002D62] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Districts
              </button>
              <button
                onClick={() => setFilterMode('HIGH_RISK')}
                className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                  filterMode === 'HIGH_RISK'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                High Risk Only (≥60)
              </button>
            </div>
          </div>

          {/* Canvas Box representing Maharashtra Geo-Coordinate Field */}
          <div className="relative w-full h-96 bg-slate-950 rounded-lg overflow-hidden border border-slate-800 p-4 select-none">
            {/* Background Grid & Silhouette Label */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
            <div className="absolute top-3 left-3 text-[10px] font-mono text-slate-400">
              MAHARASHTRA STATE GRID • PROJECTION EPSG:3857
            </div>
            <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-600"></span> Critical (≥80)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span> High (60-79)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Low (&lt;40)
              </span>
            </div>

            {/* Interactive District Pins */}
            {displayedDistricts.map((dist) => {
              const isSelected = selectedDistrict === dist.name;
              const colorClass =
                dist.avgRisk >= 80
                  ? 'bg-rose-600 ring-rose-400'
                  : dist.avgRisk >= 60
                  ? 'bg-orange-500 ring-orange-300'
                  : dist.avgRisk >= 40
                  ? 'bg-amber-500 ring-amber-300'
                  : 'bg-emerald-500 ring-emerald-300';

              return (
                <div
                  key={dist.name}
                  onClick={() => setSelectedDistrict(dist.name)}
                  style={{ left: `${dist.x}%`, top: `${dist.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform group ${
                    isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold font-mono shadow-lg ring-2 ${colorClass} ${
                        isSelected ? 'ring-4 ring-white animate-pulse' : ''
                      }`}
                    >
                      {dist.avgRisk}
                    </div>
                    <span
                      className={`text-[10px] font-bold mt-1 px-1.5 py-0.2 rounded whitespace-nowrap transition-colors ${
                        isSelected
                          ? 'bg-white text-slate-900 shadow'
                          : 'bg-slate-900/80 text-slate-300 group-hover:text-white'
                      }`}
                    >
                      {dist.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-gray-500">
            Click on any district node above to inspect its sanctioned works and localized risk score.
          </p>
        </div>

        {/* Right: Selected District Inspector Details */}
        <div className="lg:col-span-5 bg-white rounded border border-gray-200 p-3.5 sm:p-4 space-y-3.5 shadow-xs">
          <div className="border-b border-gray-100 pb-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                District Surveillance Inspector
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-800">
                Index: {activeDistrictInfo.avgRisk} / 100
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#002D62] mt-1">
              {activeDistrictInfo.name} District
            </h3>
          </div>

          {/* District Metrics Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded bg-slate-50 border border-gray-200">
              <span className="text-[10px] uppercase font-semibold text-gray-500 block">Monitored Works</span>
              <span className="text-base font-bold font-mono text-[#002D62]">
                {activeDistrictInfo.projectCount} Projects
              </span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-gray-200">
              <span className="text-[10px] uppercase font-semibold text-gray-500 block">Sanctioned</span>
              <span className="text-base font-bold font-mono text-[#002D62]">
                ₹{activeDistrictInfo.sanctionedLakhs}L
              </span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-gray-200">
              <span className="text-[10px] uppercase font-semibold text-gray-500 block">Disbursed</span>
              <span className="text-base font-bold font-mono text-red-600">
                ₹{activeDistrictInfo.expenditureLakhs}L
              </span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-gray-200">
              <span className="text-[10px] uppercase font-semibold text-gray-500 block">Critical Flags</span>
              <span className="text-base font-bold font-mono text-red-700">
                {activeDistrictInfo.criticalCount} Active
              </span>
            </div>
          </div>

          {/* District Projects List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#002D62] mb-2">
              Projects in {activeDistrictInfo.name} ({districtProjects.length})
            </h4>
            <div className="space-y-2">
              {districtProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigateToProject(p.id)}
                  className="p-2.5 bg-slate-50 hover:bg-blue-50/50 rounded border border-gray-200 cursor-pointer transition-colors space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#002D62]">{p.id}</span>
                    <RiskBadge level={p.riskLevel} score={p.riskScore} size="sm" />
                  </div>
                  <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                  <div className="text-[11px] text-gray-500 flex justify-between">
                    <span>Progress: {p.physicalProgress}%</span>
                    <span>Spent: ₹{p.expenditure}L / ₹{p.sanctionedAmount}L</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
