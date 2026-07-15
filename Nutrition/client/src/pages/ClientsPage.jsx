import { useEffect, useState } from 'react';
import api, { apiError } from '../api/client.js';
import EmptyState from '../components/EmptyState.jsx';

const initialForm = {
  user: '', dietitian: '', dateOfBirth: '', gender: 'prefer-not-to-say', heightCm: 170,
  currentWeightKg: 70, targetWeightKg: 65, activityLevel: 'moderate', goal: 'maintenance',
  dailyCalorieTarget: 2000, dietaryPreference: 'vegetarian', allergies: '', medicalConditions: '', notes: '',
};

const selectOptions = {
  gender: ['female', 'male', 'non-binary', 'prefer-not-to-say'],
  activityLevel: ['sedentary', 'light', 'moderate', 'active', 'very-active'],
  goal: ['weight-loss', 'weight-gain', 'maintenance', 'muscle-gain', 'medical'],
  dietaryPreference: ['vegetarian', 'vegan', 'non-vegetarian', 'eggetarian', 'other'],
};

const pretty = (value) => value.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [clientRes, userRes] = await Promise.all([api.get('/clients'), api.get('/clients/unassigned-users')]);
      setClients(clientRes.data.clients); setAvailableUsers(userRes.data.users);
    } catch (err) { setError(apiError(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const editClient = (client) => {
    setEditing(client._id);
    setForm({
      user: client.user._id, dietitian: client.dietitian?._id || '', dateOfBirth: client.dateOfBirth?.slice(0, 10) || '',
      gender: client.gender, heightCm: client.heightCm, currentWeightKg: client.currentWeightKg,
      targetWeightKg: client.targetWeightKg, activityLevel: client.activityLevel, goal: client.goal,
      dailyCalorieTarget: client.dailyCalorieTarget, dietaryPreference: client.dietaryPreference,
      allergies: client.allergies.join(', '), medicalConditions: client.medicalConditions.join(', '), notes: client.notes,
    });
    setOpen(true);
  };

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    const payload = {
      ...form,
      allergies: form.allergies.split(',').map((item) => item.trim()).filter(Boolean),
      medicalConditions: form.medicalConditions.split(',').map((item) => item.trim()).filter(Boolean),
    };
    try {
      if (editing) await api.put(`/clients/${editing}`, payload); else await api.post('/clients', payload);
      setOpen(false); setEditing(null); setForm(initialForm); await load();
    } catch (err) { setError(apiError(err)); }
    finally { setBusy(false); }
  };

  const remove = async (client) => {
    if (!window.confirm(`Remove ${client.user.name}'s client profile?`)) return;
    try { await api.delete(`/clients/${client._id}`); await load(); } catch (err) { setError(apiError(err)); }
  };

  return (
    <div>
      <div className="page-header"><div><div className="eyebrow">CARE MANAGEMENT</div><h1>Clients</h1><p>Create complete nutrition profiles and keep every goal in view.</p></div><button className="btn btn-primary" onClick={() => { setForm(initialForm); setEditing(null); setOpen(true); }}><i className="bi bi-person-plus" /> New client</button></div>
      {error && <div className="alert alert-danger">{error}</div>}
      {open && <section className="panel form-panel mb-4">
        <div className="panel-head"><div><h3>{editing ? 'Edit client profile' : 'Create client profile'}</h3><p>Fields are validated again by the secure API.</p></div><button className="icon-button" onClick={() => setOpen(false)}><i className="bi bi-x-lg" /></button></div>
        <form onSubmit={submit} className="row g-3">
          <div className="col-md-6"><label className="form-label">User account</label><select className="form-select" required disabled={Boolean(editing)} value={form.user} onChange={(e) => setForm({ ...form, user: e.target.value })}><option value="">Select a registered user</option>{editing && clients.filter((c) => c._id === editing).map((c) => <option key={c.user._id} value={c.user._id}>{c.user.name} — {c.user.email}</option>)}{availableUsers.map((u) => <option key={u._id} value={u._id}>{u.name} — {u.email}</option>)}</select></div>
          <div className="col-md-3"><label className="form-label">Date of birth</label><input type="date" className="form-control" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
          <div className="col-md-3"><label className="form-label">Gender</label><select className="form-select" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>{selectOptions.gender.map((v) => <option key={v} value={v}>{pretty(v)}</option>)}</select></div>
          <div className="col-sm-4"><label className="form-label">Height (cm)</label><input type="number" min="50" max="260" className="form-control" required value={form.heightCm} onChange={(e) => setForm({ ...form, heightCm: e.target.value })} /></div>
          <div className="col-sm-4"><label className="form-label">Current weight (kg)</label><input type="number" min="20" max="500" step="0.1" className="form-control" required value={form.currentWeightKg} onChange={(e) => setForm({ ...form, currentWeightKg: e.target.value })} /></div>
          <div className="col-sm-4"><label className="form-label">Target weight (kg)</label><input type="number" min="20" max="500" step="0.1" className="form-control" required value={form.targetWeightKg} onChange={(e) => setForm({ ...form, targetWeightKg: e.target.value })} /></div>
          {['activityLevel', 'goal', 'dietaryPreference'].map((field) => <div className="col-md-4" key={field}><label className="form-label">{pretty(field.replace(/([A-Z])/g, '-$1').toLowerCase())}</label><select className="form-select" value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })}>{selectOptions[field].map((v) => <option key={v} value={v}>{pretty(v)}</option>)}</select></div>)}
          <div className="col-md-4"><label className="form-label">Daily calorie target</label><input type="number" min="800" max="7000" className="form-control" required value={form.dailyCalorieTarget} onChange={(e) => setForm({ ...form, dailyCalorieTarget: e.target.value })} /></div>
          <div className="col-md-4"><label className="form-label">Allergies</label><input className="form-control" placeholder="Peanuts, lactose" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} /></div>
          <div className="col-md-4"><label className="form-label">Medical conditions</label><input className="form-control" placeholder="Diabetes, hypertension" value={form.medicalConditions} onChange={(e) => setForm({ ...form, medicalConditions: e.target.value })} /></div>
          <div className="col-12"><label className="form-label">Care notes</label><textarea className="form-control" rows="2" maxLength="1000" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="col-12 d-flex justify-content-end gap-2"><button type="button" className="btn btn-light" onClick={() => setOpen(false)}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save client'}</button></div>
        </form>
      </section>}

      <section className="panel">
        {loading ? <div className="app-loader local"><div className="spinner-border text-success" /></div> : clients.length ? <div className="table-responsive"><table className="table align-middle modern-table"><thead><tr><th>Client</th><th>Goal</th><th>Plan target</th><th>Diet</th><th>Progress</th><th /></tr></thead><tbody>{clients.map((client) => { const delta = Number(client.currentWeightKg - client.targetWeightKg).toFixed(1); return <tr key={client._id}><td><div className="person-cell"><div className="avatar soft">{client.user.name[0]}</div><div><strong>{client.user.name}</strong><span>{client.user.email}</span></div></div></td><td><span className="soft-badge">{pretty(client.goal)}</span></td><td><strong>{client.dailyCalorieTarget}</strong> kcal/day</td><td>{pretty(client.dietaryPreference)}</td><td><strong>{client.currentWeightKg} kg</strong><span className="d-block text-secondary small">{Math.abs(delta)} kg {delta > 0 ? 'above' : 'below'} target</span></td><td className="text-end"><button className="icon-button" title="Edit" onClick={() => editClient(client)}><i className="bi bi-pencil" /></button><button className="icon-button danger" title="Delete" onClick={() => remove(client)}><i className="bi bi-trash3" /></button></td></tr>; })}</tbody></table></div> : <EmptyState icon="bi-people" title="No clients yet" text="Add a registered wellness user to begin planning their nutrition journey." />}
      </section>
    </div>
  );
}
