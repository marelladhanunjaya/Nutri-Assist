import { useEffect, useState } from 'react';
import api, { apiError } from '../api/client.js';
import EmptyState from '../components/EmptyState.jsx';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try { const { data } = await api.get('/admin/users'); setUsers(data.users); }
    catch (err) { setError(apiError(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const update = async (id, payload) => {
    setError('');
    try { await api.patch(`/admin/users/${id}`, payload); await load(); }
    catch (err) { setError(apiError(err)); }
  };
  const visible = users.filter((user) => filter === 'all' || user.status === filter || user.role === filter);

  return (
    <div>
      <div className="page-header"><div><div className="eyebrow">PLATFORM OVERSIGHT</div><h1>Administration</h1><p>Approve professionals and control role-based platform access.</p></div></div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="admin-filter mb-3">{['all', 'pending', 'active', 'suspended', 'dietitian', 'user'].map((value) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{value}</button>)}</div>
      <section className="panel">
        {loading ? <div className="app-loader local"><div className="spinner-border text-success" /></div> : visible.length ? <div className="table-responsive"><table className="table modern-table align-middle"><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead><tbody>{visible.map((item) => <tr key={item._id}><td><div className="person-cell"><div className="avatar soft">{item.name[0]}</div><div><strong>{item.name}</strong><span>{item.email}</span></div></div></td><td><select className="form-select form-select-sm compact-select" value={item.role} onChange={(e) => update(item._id, { role: e.target.value })}>{['user', 'dietitian', 'admin'].map((role) => <option key={role}>{role}</option>)}</select></td><td><span className={`status-pill ${item.status}`}>{item.status}</span></td><td>{new Date(item.createdAt).toLocaleDateString('en-IN')}</td><td>{item.status === 'pending' && <button className="btn btn-sm btn-success me-2" onClick={() => update(item._id, { status: 'active' })}><i className="bi bi-check-lg" /> Approve</button>}{item.status === 'active' ? <button className="btn btn-sm btn-outline-danger" onClick={() => update(item._id, { status: 'suspended' })}>Suspend</button> : item.status === 'suspended' && <button className="btn btn-sm btn-outline-success" onClick={() => update(item._id, { status: 'active' })}>Reactivate</button>}</td></tr>)}</tbody></table></div> : <EmptyState icon="bi-person-check" title="No matching users" text="Try a different role or status filter." />}
      </section>
    </div>
  );
}
