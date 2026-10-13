import React, { useState, useEffect } from 'react';
import { departmentApi } from '../../api/departmentApi';
import { adminApi } from '../../api/adminApi';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { Building, Plus, Stethoscope, Layers } from 'lucide-react';

export const AdminDepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Department Modal
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptLoading, setDeptLoading] = useState(false);

  // Specialization Modal
  const [specModalOpen, setSpecModalOpen] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [specName, setSpecName] = useState('');
  const [specDesc, setSpecDesc] = useState('');
  const [specLoading, setSpecLoading] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const res = await departmentApi.getAllDepartments();
      if (res?.success && Array.isArray(res.data)) {
        setDepartments(res.data);
      }
    } catch {
      setError('Could not load departments.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    setDeptLoading(true);
    setError(null);

    try {
      await adminApi.createDepartment({
        name: deptName.trim(),
        description: deptDesc.trim(),
      });
      setDeptModalOpen(false);
      setDeptName('');
      setDeptDesc('');
      setMessage('Department created successfully.');
      loadDepartments();
    } catch (err) {
      setError(err.message || 'Could not create department.');
    } finally {
      setDeptLoading(false);
    }
  };

  const handleCreateSpec = async (e) => {
    e.preventDefault();
    setSpecLoading(true);
    setError(null);

    try {
      await adminApi.createSpecialization({
        departmentId: Number(selectedDeptId),
        name: specName.trim(),
        description: specDesc.trim(),
      });
      setSpecModalOpen(false);
      setSpecName('');
      setSpecDesc('');
      setMessage('Specialization added successfully.');
      loadDepartments();
    } catch (err) {
      setError(err.message || 'Could not create specialization.');
    } finally {
      setSpecLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Departments & Clinical Specializations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize medical specialty taxonomy used by the AI triage engine and doctor directory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Plus} onClick={() => setSpecModalOpen(true)}>
            Add Specialization
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => setDeptModalOpen(true)}>
            Create Department
          </Button>
        </div>
      </div>

      {message && <Alert type="success" message={message} onClose={() => setMessage(null)} />}
      {error && <Alert type="danger" message={error} onClose={() => setError(null)} />}

      {loading ? (
        <SkeletonLoader count={4} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{dept.name}</h3>
                    <span className="text-[11px] text-slate-400">ID #{dept.id}</span>
                  </div>
                </div>
                <Badge variant="primary" size="sm">
                  {dept.specializations?.length || 0} Specialties
                </Badge>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {dept.description || 'Comprehensive clinical care and medical evaluation.'}
              </p>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                  Sub-Specializations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {dept.specializations?.map((spec) => (
                    <span
                      key={spec.id}
                      className="px-2.5 py-1 bg-teal-50/70 border border-teal-100 text-teal-800 rounded-lg text-xs font-medium"
                    >
                      {spec.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Department Modal */}
      {deptModalOpen && (
        <Modal
          isOpen={deptModalOpen}
          onClose={() => setDeptModalOpen(false)}
          title="Create Medical Department"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateDept} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name *</label>
              <input
                type="text"
                required
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                placeholder="e.g. Oncology"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={deptDesc}
                onChange={(e) => setDeptDesc(e.target.value)}
                placeholder="Scope of medical practice..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setDeptModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={deptLoading}>
                Create Department
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create Specialization Modal */}
      {specModalOpen && (
        <Modal
          isOpen={specModalOpen}
          onClose={() => setSpecModalOpen(false)}
          title="Add New Specialization"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateSpec} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
              <select
                required
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Specialization Name *</label>
              <input
                type="text"
                required
                value={specName}
                onChange={(e) => setSpecName(e.target.value)}
                placeholder="e.g. Pediatric Oncologist"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={specDesc}
                onChange={(e) => setSpecDesc(e.target.value)}
                placeholder="Clinical specialization notes..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSpecModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={specLoading}>
                Save Specialization
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
