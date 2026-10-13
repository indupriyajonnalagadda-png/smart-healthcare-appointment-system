import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { formatCurrency } from '../../utils/formatters';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Activity, 
  TrendingUp,
  AlertTriangle,
  Building
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDashboardStats();
      if (res?.success && res.data) {
        setStats(res.data);
      }
    } catch {
      // Graceful
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SkeletonLoader count={4} />;
  }

  // Data for charts
  const statusChartData = stats ? [
    { name: 'Confirmed', value: stats.confirmedAppointments, color: '#0d9488' },
    { name: 'Completed', value: stats.completedAppointments, color: '#0284c7' },
    { name: 'Cancelled', value: stats.cancelledAppointments, color: '#f43f5e' },
  ] : [];

  const deptChartData = stats?.appointmentsByDepartment
    ? Object.entries(stats.appointmentsByDepartment).map(([dept, count]) => ({
        name: dept,
        appointments: count,
      }))
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Administrative Overview</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Clinic Analytics & Hospital Operations
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time metrics, appointment volume, department utilization, and clinical revenue.
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block">Patients</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalPatients || 0}</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block">Active Doctors</span>
          <h3 className="text-2xl font-extrabold text-teal-700 mt-1">{stats?.totalDoctors || 0}</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block">Pending Approvals</span>
          <h3 className={`text-2xl font-extrabold mt-1 ${stats?.pendingDoctorApprovals > 0 ? 'text-amber-500' : 'text-slate-800'}`}>
            {stats?.pendingDoctorApprovals || 0}
          </h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block">Appointments</span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.totalAppointments || 0}</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block">Consultations Done</span>
          <h3 className="text-2xl font-extrabold text-sky-700 mt-1">{stats?.completedAppointments || 0}</h3>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block">Total Revenue</span>
          <h3 className="text-xl font-extrabold text-emerald-700 mt-1 truncate">
            {formatCurrency(stats?.totalRevenue || 0)}
          </h3>
        </div>
      </div>

      {/* Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Volume Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Appointments by Department</h3>
              <p className="text-xs text-slate-400">Consultation volume distribution across clinical specialties.</p>
            </div>
            <Activity className="w-5 h-5 text-teal-600" />
          </div>

          <div className="h-64 pt-2">
            {deptChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="appointments" fill="#0d9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No department appointment data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Status Breakdown Pie Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Consultation Statuses</h3>
              <p className="text-xs text-slate-400">Confirmed vs. Completed vs. Cancelled.</p>
            </div>
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>

          <div className="h-64 pt-2">
            {statusChartData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend textAnchor="start" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No appointment status history yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
