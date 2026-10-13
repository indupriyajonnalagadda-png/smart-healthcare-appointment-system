import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doctorApi } from '../../api/doctorApi';
import { departmentApi } from '../../api/departmentApi';
import { DoctorFilterBar } from '../../components/doctors/DoctorFilterBar';
import { DoctorCard } from '../../components/doctors/DoctorCard';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { BookingModal } from '../../components/appointments/BookingModal';
import { Stethoscope, AlertCircle } from 'lucide-react';

export const DoctorSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] = useState(null);

  const query = searchParams.get('query') || '';
  const departmentId = searchParams.get('departmentId') ? Number(searchParams.get('departmentId')) : null;
  const sortBy = searchParams.get('sortBy') || 'rating';

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [query, departmentId, sortBy]);

  const loadDepartments = async () => {
    try {
      const res = await departmentApi.getAllDepartments();
      if (res?.success && Array.isArray(res.data)) {
        setDepartments(res.data);
      }
    } catch {
      // Graceful
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {
        query: query || undefined,
        departmentId: departmentId || undefined,
        sortBy: sortBy || 'rating',
        direction: 'desc',
        size: 18,
      };
      const res = await doctorApi.searchDoctors(params);
      if (res?.success && res.data?.content) {
        setDoctors(res.data.content);
      } else {
        setDoctors([]);
      }
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const updateSearchQuery = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set('query', val);
    else next.delete('query');
    setSearchParams(next);
  };

  const updateDepartment = (val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set('departmentId', val);
    else next.delete('departmentId');
    setSearchParams(next);
  };

  const updateSort = (val) => {
    const next = new URLSearchParams(searchParams);
    next.set('sortBy', val);
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Find a Doctor & Book Consultation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Browse verified board-certified physicians, view profiles, and book available 30-minute appointment slots.
        </p>
      </div>

      {/* Filter Bar */}
      <DoctorFilterBar
        searchQuery={query}
        onSearchChange={updateSearchQuery}
        departments={departments}
        selectedDepartment={departmentId}
        onDepartmentChange={updateDepartment}
        sortBy={sortBy}
        onSortChange={updateSort}
        onClear={clearFilters}
      />

      {/* Doctor List / Skeletons / Empty */}
      {loading ? (
        <SkeletonLoader count={6} type="doctor-card" />
      ) : doctors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onBook={(doc) => setSelectedDoctorForBooking(doc)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Stethoscope}
          title="No doctors found"
          description="We couldn't find any doctors matching your search filters. Try adjusting your query or selecting another department."
          actionLabel="Clear all filters"
          onAction={clearFilters}
        />
      )}

      {/* Booking Modal */}
      {selectedDoctorForBooking && (
        <BookingModal
          isOpen={!!selectedDoctorForBooking}
          onClose={() => setSelectedDoctorForBooking(null)}
          doctor={selectedDoctorForBooking}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
};
