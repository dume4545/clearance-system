import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Navbar from '../components/Navbar';
import StatusBadge from '../components/StatusBadge';

const TABS = ['Overview', 'Students', 'Staff', 'Clearances', 'Activity'];

export default function AdminDashboard() {
  const [tab,       setTab]       = useState('Overview');
  const [overview,  setOverview]  = useState(null);
  const [users,     setUsers]     = useState([]);
  const [clearances,setClearances] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState('');

  const loadOverview = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/dashboard.php');
      setOverview(data);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, []);

  const loadUsers = useCallback(async role => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/admin/users.php?role=${role}&search=${search}`);
      setUsers(data.users);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [search]);

  const loadClearances = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/admin/clearances.php?search=${search}`);
      setClearances(data.clearances);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    if (tab === 'Overview') loadOverview();
    else if (tab === 'Students') loadUsers('student');
    else if (tab === 'Staff') loadUsers('staff');
    else if (tab === 'Clearances') loadClearances();
    else if (tab === 'Activity') loadOverview();
  }, [tab, loadOverview, loadUsers, loadClearances]);

  const toggleActive = async userId => {
    try {
      await api.put('/api/admin/users.php', { user_id: userId, action: 'toggle_active' });
      toast.success('User status updated.');
      if (tab === 'Students') loadUsers('student');
      else loadUsers('staff');
    } catch (err) { toast.error(err.message); }
  };

  const deleteUser = async userId => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/api/admin/users.php?user_id=${userId}`);
      toast.success('User deleted.');
      if (tab === 'Students') loadUsers('student');
      else loadUsers('staff');
    } catch (err) { toast.error(err.message); }
  };

  const StatCard = ({ label, value, color = 'text-gray-800', icon }) => (
    <div className="card flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-500 text-sm">Full system oversight and management</p>
        </div>

        {/* tab bar */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors
                ${tab === t
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* ── Overview tab ── */}
        {tab === 'Overview' && overview && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon="👨‍🎓" label="Total Students"   value={overview.overview.total_students}   color="text-brand-700" />
              <StatCard icon="👩‍💼" label="Total Staff"       value={overview.overview.total_staff}       color="text-purple-600" />
              <StatCard icon="🎓" label="Fully Cleared"     value={overview.overview.fully_cleared}     color="text-green-600" />
              <StatCard icon="⏳" label="Pending Requests"  value={overview.overview.pending_requests}  color="text-yellow-600" />
            </div>

            <div className="card">
              <h3 className="font-semibold text-gray-800 mb-4">Per-Department Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      {['Department','Pending','Approved','Rejected'].map(h => (
                        <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {overview.department_breakdown.map(d => (
                      <tr key={d.code} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{d.name}</td>
                        <td className="px-4 py-3"><span className="badge-pending">{d.pending ?? 0}</span></td>
                        <td className="px-4 py-3"><span className="badge-approved">{d.approved ?? 0}</span></td>
                        <td className="px-4 py-3"><span className="badge-rejected">{d.rejected ?? 0}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Activity tab ── */}
        {tab === 'Activity' && overview && (
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">Recent System Activity</h3>
            <div className="divide-y divide-gray-50">
              {overview.recent_activity.map((a, i) => (
                <div key={i} className="py-3 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{a.action.replace(/_/g, ' ')}</p>
                    {a.details && <p className="text-xs text-gray-400">{a.details}</p>}
                    <p className="text-xs text-gray-300 mt-0.5">
                      {a.user_name && `${a.user_name} · `}
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Students / Staff tab ── */}
        {(tab === 'Students' || tab === 'Staff') && (
          <div>
            <div className="flex gap-3 mb-4">
              <input className="input max-w-xs"
                placeholder={`Search ${tab.toLowerCase()}…`}
                value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (
                  tab === 'Students' ? loadUsers('student') : loadUsers('staff')
                )}
              />
              <button onClick={() => tab === 'Students' ? loadUsers('student') : loadUsers('staff')}
                className="btn-primary px-5">Search</button>
            </div>

            <div className="card overflow-x-auto p-0">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent" />
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['Name','Email',
                        tab === 'Students' ? 'Matric No.' : 'Department',
                        'Status','Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{u.name}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {tab === 'Students' ? (u.matric_number ?? '—') : (u.department_name ?? '—')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full
                            ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => toggleActive(u.id)}
                              className="text-xs text-brand-600 hover:underline">
                              {u.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button onClick={() => deleteUser(u.id)}
                              className="text-xs text-red-500 hover:underline">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── Clearances tab ── */}
        {tab === 'Clearances' && (
          <div>
            <div className="flex gap-3 mb-4">
              <input className="input max-w-xs" placeholder="Search student name or matric…"
                value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadClearances()} />
              <button onClick={loadClearances} className="btn-primary px-5">Search</button>
            </div>

            <div className="card overflow-x-auto p-0">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-brand-600 border-t-transparent" />
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      {['Student','Matric','Department','Status','Reviewed By','Date'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {clearances.map((c, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{c.student_name}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{c.matric_number ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{c.department_name}</td>
                        <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{c.reviewed_by ?? '—'}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(c.updated_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
