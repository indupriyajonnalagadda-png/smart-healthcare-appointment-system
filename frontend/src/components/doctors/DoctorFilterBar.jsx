import React from 'react';
import { Search, Filter, X } from 'lucide-react';

export const DoctorFilterBar = ({
  searchQuery,
  onSearchChange,
  departments,
  selectedDepartment,
  onDepartmentChange,
  sortBy,
  onSortChange,
  onClear,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search doctors by name, specialty, or condition..."
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
        />
      </div>

      {/* Department Dropdown */}
      <div className="sm:w-56">
        <select
          value={selectedDepartment || ''}
          onChange={(e) => onDepartmentChange(e.target.value ? Number(e.target.value) : null)}
          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sort Dropdown */}
      <div className="sm:w-44">
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
        >
          <option value="rating">Top Rated</option>
          <option value="experienceYears">Experience</option>
          <option value="consultationFee">Fee: Low to High</option>
        </select>
      </div>

      {/* Clear Filter Button */}
      {(searchQuery || selectedDepartment) && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      )}
    </div>
  );
};
