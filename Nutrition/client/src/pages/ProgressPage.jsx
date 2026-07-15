import { useEffect, useMemo, useState } from 'react';
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api, { apiError } from '../api/client.js';
import EmptyState from '../components/EmptyState.jsx';
import StatCard from '../components/StatCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const initialEntry = (client = '') => ({
  client, date: new Date().toISOString().slice(0, 10), weightKg: 70, caloriesConsumed: 2000,
  waterLitres: 2.5, exerciseMinutes: 30, adherencePercent: 80, mood: 'good', notes: '',
});

export default function ProgressPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({});
  const [form, setForm] = useState(initialEntry());
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadClients = async () => {
    try {
      const { data } = await api.get('/clients');
      setClients(data.clients);
      const first = selectedClient || data.clients[0]?._id || '';
      setSelectedClient(first);
      setForm((current) => ({ ...current, client: first }));
      return first;
    } catch (err) { setError(apiError(err)); return ''; }
  };

  const loadProgress = async (clientId) => {
    if (!clientId) { setEntries([]); setLoading(false); return; }
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/progress', { params: { client: clientId } });
      setEntries(data.progress); setSummary(data.summary);
    } catch (err) { setError(apiError(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadClients().then(loadProgress); }, []);
  const chooseClient = (clientId) => { setSelectedClient(clientId); setForm(initialEntry(clientId)); loadProgress(clientId); };

  const chartData = useMemo(() => entries.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    weight: entry.weightKg, calories: entry.caloriesConsumed, adherence: entry.adherencePercent,
  })), [entries]);

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (editing) await api.put(`/progress/${editing}`, form); else await api.post('/progress', form);
      setOpen(false); setEditing(null); setForm(initialEntry(selectedClient)); await loadProgress(selectedClient);
    } catch (err) { setError(apiError(err)); }
    finally { setBusy(false); }
  };

  const openEdit = (entry) => {
    setEditing(entry._id);
    setForm({
      client: entry.client._id, date: entry.date.slice(0, 10), weightKg: entry.weightKg,
      caloriesConsumed: entry.caloriesConsumed, waterLitres: entry.waterLitres,
      exerciseMinutes: entry.exerciseMinutes, adherencePercent: entry.adherencePercent,
      mood: entry.mood, notes: entry.notes,
    });
    setOpen(true);
  };

  const remove = async (entry) => {
    if (!window.confirm('Delete this progress check-in?')) return;
    try { await api.delete(`/progress/${entry._id}`); await loadProgress(selectedClient); } catch (err) { setError(apiError(err)); }
  };

  return (
    <div>
      <div className="page-header"><div><div className="eyebrow">MEASURABLE CHANGE</div><h1>Progress tracking</h1><p>Turn daily check-ins into clear, actionable nutrition insights.</p></div><button className="btn btn-primary" disabled={!selectedClient} onClick={() => { setEditing(null); setForm(initialEntry(selectedClient)); setOpen(true); }}><i className="bi bi-plus-lg" /> Log check-in</button></div>
      {error && <div className="alert alert-danger">{error}</div>}
      {user.role !== 'user' && clients.length > 0 && <div className="client-filter mb-4"><label>Viewing progress for</label><select className="form-select" value={selectedClient} onChange={(e) => chooseClient(e.target.value)}>{clients.map((client) => <option key={client._id} value={client._id}>{client.user.name}</option>)}</select></div>}

      {open && <section className="panel form-panel mb-4">
        <div className="panel-head"><div><h3>{editing ? 'Edit check-in' : 'New progress check-in'}</h3><p>Record consistent metrics for better trend analysis.</p></div><button className="icon-button" onClick={() => setOpen(false)}><i className="bi bi-x-lg" /></button></div>
        <form className="row g-3" onSubmit={submit}>
          <div className="col-md-3"><label className="form-label">Date</label><input required type="date" className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div className="col-md-3"><label className="form-label">Weight (kg)</label><input required type="number" min="20" max="500" step="0.1" className="form-control" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} /></div>
          <div className="col-md-3"><label className="form-label">Calories consumed</label><input required type="number" min="0" max="15000" className="form-control" value={form.caloriesConsumed} onChange={(e) => setForm({ ...form, caloriesConsumed: e.target.value })} /></div>
          <div className="col-md-3"><label className="form-label">Water (litres)</label><input required type="number" min="0" max="15" step="0.1" className="form-control" value={form.waterLitres} onChange={(e) => setForm({ ...form, waterLitres: e.target.value })} /></div>
          <div className="col-md-3"><label className="form-label">Exercise minutes</label><input required type="number" min="0" max="1440" className="form-control" value={form.exerciseMinutes} onChange={(e) => setForm({ ...form, exerciseMinutes: e.target.value })} /></div>
          <div className="col-md-3"><label className="form-label">Plan adherence (%)</label><input required type="number" min="0" max="100" className="form-control" value={form.adherencePercent} onChange={(e) => setForm({ ...form, adherencePercent: e.target.value })} /></div>
          <div className="col-md-3"><label className="form-label">Mood</label><select className="form-select" value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })}>{['great', 'good', 'okay', 'low'].map((mood) => <option key={mood}>{mood}</option>)}</select></div>
          <div className="col-md-3"><label className="form-label">Notes</label><input className="form-control" maxLength="500" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="col-12 d-flex justify-content-end gap-2"><button type="button" className="btn btn-light" onClick={() => setOpen(false)}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save check-in'}</button></div>
        </form>
      </section>}

      {selectedClient && <div className="row g-3 mb-4">
        <div className="col-6 col-xl-3"><StatCard icon="bi-bullseye" label="Average adherence" value={`${summary.averageAdherence || 0}%`} helper="Plan consistency" /></div>
        <div className="col-6 col-xl-3"><StatCard icon="bi-fire" label="Average calories" value={summary.averageCalories || 0} helper="Daily intake" tone="orange" /></div>
        <div className="col-6 col-xl-3"><StatCard icon="bi-activity" label="Weight change" value={`${summary.weightChange > 0 ? '+' : ''}${summary.weightChange || 0} kg`} helper="First to latest entry" tone="blue" /></div>
        <div className="col-6 col-xl-3"><StatCard icon="bi-calendar2-check" label="Check-ins" value={summary.entries || 0} helper="Recorded entries" tone="purple" /></div>
      </div>}

      <section className="panel mb-4">
        <div className="panel-head"><div><h3>Nutrition trend</h3><p>Weight, calorie intake and adherence over time</p></div></div>
        {loading ? <div className="app-loader local"><div className="spinner-border text-success" /></div> : chartData.length ? <div className="chart-wrap tall"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edea"/><XAxis dataKey="date" axisLine={false} tickLine={false}/><YAxis yAxisId="left" axisLine={false} tickLine={false}/><YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false}/><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e1e9e5' }}/><Legend/><Bar yAxisId="right" dataKey="adherence" fill="#b9dccb" radius={[6,6,0,0]} /><Line yAxisId="left" type="monotone" dataKey="weight" stroke="#246a52" strokeWidth={3} dot={{ fill: '#246a52' }} /><Line yAxisId="right" type="monotone" dataKey="calories" stroke="#e99b43" strokeWidth={2} dot={false}/></ComposedChart></ResponsiveContainer></div> : <EmptyState icon="bi-graph-up" title="No progress data" text={clients.length ? 'Log the first check-in to generate charts.' : 'A client profile must be created before progress can be tracked.'} />}
      </section>

      {entries.length > 0 && <section className="panel"><div className="panel-head"><div><h3>Check-in history</h3><p>Every recorded nutrition and wellness metric</p></div></div><div className="table-responsive"><table className="table modern-table align-middle"><thead><tr><th>Date</th><th>Weight</th><th>Calories</th><th>Water</th><th>Exercise</th><th>Adherence</th><th /></tr></thead><tbody>{[...entries].reverse().map((entry) => <tr key={entry._id}><td><strong>{new Date(entry.date).toLocaleDateString('en-IN')}</strong><span className="d-block small text-secondary text-capitalize">{entry.mood} mood</span></td><td>{entry.weightKg} kg</td><td>{entry.caloriesConsumed} kcal</td><td>{entry.waterLitres} L</td><td>{entry.exerciseMinutes} min</td><td><div className="progress slim"><div className="progress-bar" style={{ width: `${entry.adherencePercent}%` }} /></div><small>{entry.adherencePercent}%</small></td><td className="text-end"><button className="icon-button" onClick={() => openEdit(entry)}><i className="bi bi-pencil" /></button><button className="icon-button danger" onClick={() => remove(entry)}><i className="bi bi-trash3" /></button></td></tr>)}</tbody></table></div></section>}
    </div>
  );
}
