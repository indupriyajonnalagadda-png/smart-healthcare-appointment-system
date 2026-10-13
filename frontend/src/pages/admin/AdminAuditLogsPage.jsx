import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Badge } from '../../components/common/Badge';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';
import { ShieldAlert, Activity, Clock, User, Filter, RefreshCw } from 'lucide-react';

export const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('');

  useEffect(() => {
    loadLogs(page);
  }, [page]);

  const loadLogs = async (currentPage = 0) => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLogs({ page: currentPage, size: 15 });
      if (res?.success && res.data) {
        setLogs(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      } else {
        setLogs([]);
      }
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeVariant = (action) => {
    if (!action) return 'default';
    const act = action.toUpperCase();
    if (act.includes('DELETE') || act.includes('CANCEL') || act.includes('REJECT') || act.includes('FAIL')) {
      return 'danger';
    }
    if (act.includes('CREATE') || act.includes('BOOK') || act.includes('APPROVE') || act.includes('REGISTER')) {
      return 'success';
    }
    if (act.includes('UPDATE') || act.includes('EDIT') || act.includes('STATUS')) {
      return 'warning';
    }
    if (act.includes('LOGIN') || act.includes('AUTH')) {
      return 'primary';
    }
    return 'default';
  };

  const filteredLogs = filterAction
    ? logs.filter((l) => l.action?.toLowerCase().includes(filterAction.toLowerCase()))
    : logs;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-teal-600" />
            System Audit & Security Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable log trail of administrative interventions, appointment state transitions, and user events.
          </p>
        </div>
        <button
          onClick={() => loadLogs(page)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-xl hover:bg-slate-50 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
          Refresh
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold">Filter Action:</span>
        </div>
        {['', 'LOGIN', 'BOOK', 'CANCEL', 'APPROVE', 'CREATE'].map((act) => (
          <button
            key={act || 'all'}
            onClick={() => setFilterAction(act)}
            className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              filterAction === act
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {act || 'All Actions'}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500 font-medium">
          Total Logs: <strong className="text-slate-800">{totalElements}</strong>
        </span>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <SkeletonLoader count={8} type="table" />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No audit entries found"
          description="System events and user security trails will appear here automatically."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Entity</th>
                  <th className="px-5 py-3.5">Details</th>
                  <th className="px-5 py-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-medium">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px] font-bold">
                          {log.userName ? log.userName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{log.userName || 'System'}</div>
                          <div className="text-[11px] text-slate-400">{log.userEmail || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <Badge variant={getActionBadgeVariant(log.action)} size="sm">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-700">
                      <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {log.entityName || 'System'} {log.entityId ? `#${log.entityId}` : ''}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate" title={log.details}>
                      {log.details || '-'}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Page <strong className="text-slate-800">{page + 1}</strong> of <strong className="text-slate-800">{totalPages}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
