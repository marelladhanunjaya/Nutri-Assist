import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api, { apiError } from '../api/client.js';
import EmptyState from '../components/EmptyState.jsx';
import StatCard from '../components/StatCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState({ clients: [], plans: [], progress: [], summary: {}, admin: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const requests = [api.get('/clients'), api.get('/meal-plans'), api.get('/progress')];
    if (user.role === 'admin') requests.push(api.get('/admin/dashboard'));
    Promise.all(requests)
      .then(([clients, plans, progress, admin]) => setData({
        clients: clients.data.clients,
        plans: plans.data.mealPlans,
        progress: progress.data.progress,
        summary: progress.data.summary,
        admin: admin?.data || null,
      }))
      .catch((err) => setError(apiError(err)))
      .finally(() => setLoading(false));
  }, [user.role]);

  const chartData = useMemo(() => data.progress.slice(-10).map((entry) => ({
    date: new Date(entry.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
    weight: entry.weightKg,
    adherence: entry.adherencePercent,
  })), [data.progress]);
  const activePlan = data.plans.find((plan) => plan.status === 'active');
  const client = data.clients[0];

  if (loading) return <div className="app-loader local"><div className="spinner-border text-success" /><span>Loading insights…</span></div>;

  return (
    <div>
      <div className="page-header">
        <div><div className="eyebrow">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</div><h1>Hello, {user.name.split(' ')[0]} <span>👋</span></h1><p>{user.role === 'dietitian' ? 'Here is how your clients are progressing.' : user.role === 'admin' ? 'Here is today’s platform health snapshot.' : 'Here is your nutrition journey at a glance.'}</p></div>
        {user.role !== 'user' && <Link className="btn btn-primary" to="/clients"><i className="bi bi-person-plus" /> Add client</Link>}
        {user.role === 'user' && <Link className="btn btn-primary" to="/progress"><i className="bi bi-plus-lg" /> Log progress</Link>}
      </div>
      {error && <div className="alert alert-danger">{error}</div>}

      {user.role === 'admin' ? (
        <div className="row g-3 mb-4">
          <div className="col-6 col-xl-3"><StatCard icon="bi-people" label="Wellness users" value={data.admin?.stats.users} helper="Registered accounts" /></div>
          <div className="col-6 col-xl-3"><StatCard icon="bi-clipboard2-pulse" label="Dietitians" value={data.admin?.stats.dietitians} helper={`${data.admin?.stats.pendingDietitians || 0} awaiting approval`} tone="blue" /></div>
          <div className="col-6 col-xl-3"><StatCard icon="bi-person-vcard" label="Client profiles" value={data.admin?.stats.clients} helper="Managed profiles" tone="orange" /></div>
          <div className="col-6 col-xl-3"><StatCard icon="bi-journal-medical" label="Meal plans" value={data.admin?.stats.mealPlans} helper="Across the platform" tone="purple" /></div>
        </div>
      ) : (
        <div className="row g-3 mb-4">
          <div className="col-6 col-xl-3"><StatCard icon="bi-people" label={user.role === 'dietitian' ? 'Active clients' : 'Current weight'} value={user.role === 'dietitian' ? data.clients.length : `${data.progress.at(-1)?.weightKg || client?.currentWeightKg || '—'} kg`} helper={user.role === 'dietitian' ? 'Under your care' : `Target ${client?.targetWeightKg || '—'} kg`} /></div>
          <div className="col-6 col-xl-3"><StatCard icon="bi-fire" label="Daily target" value={`${client?.dailyCalorieTarget || activePlan?.totals?.calories || '—'} kcal`} helper={activePlan ? activePlan.title : 'No active plan'} tone="orange" /></div>
          <div className="col-6 col-xl-3"><StatCard icon="bi-bullseye" label="Avg. adherence" value={`${data.summary.averageAdherence || 0}%`} helper="Across logged entries" tone="blue" /></div>
          <div className="col-6 col-xl-3"><StatCard icon="bi-graph-down-arrow" label="Weight change" value={`${data.summary.weightChange > 0 ? '+' : ''}${data.summary.weightChange || 0} kg`} helper={`${data.summary.entries || 0} progress entries`} tone="purple" /></div>
        </div>
      )}

      <div className="row g-4">
        <div className="col-xl-8">
          <section className="panel h-100">
            <div className="panel-head"><div><h3>{user.role === 'dietitian' ? 'Client progress trend' : 'Progress trend'}</h3><p>Recent weight and adherence records</p></div><Link to="/progress">View details <i className="bi bi-arrow-right" /></Link></div>
            {chartData.length ? (
              <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><defs><linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2f8f6b" stopOpacity={0.3}/><stop offset="95%" stopColor="#2f8f6b" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8edea"/><XAxis dataKey="date" axisLine={false} tickLine={false} fontSize={12}/><YAxis axisLine={false} tickLine={false} fontSize={12}/><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e1e9e5' }}/><Area type="monotone" dataKey="weight" stroke="#2f8f6b" strokeWidth={3} fill="url(#weightFill)"/></AreaChart></ResponsiveContainer></div>
            ) : <EmptyState title="No progress yet" text="Add the first check-in to unlock trends and insights." />}
          </section>
        </div>
        <div className="col-xl-4">
          <section className="panel h-100">
            <div className="panel-head"><div><h3>Active meal plan</h3><p>Current nutrition prescription</p></div></div>
            {activePlan ? <div className="active-plan"><div className="plan-hero"><i className="bi bi-basket2-fill" /><span className="badge">ACTIVE</span></div><h4>{activePlan.title}</h4><p>{activePlan.description || 'Personalized for the current nutrition goal.'}</p><div className="macro-grid"><span><strong>{activePlan.totals.calories}</strong> kcal</span><span><strong>{activePlan.totals.protein}g</strong> protein</span><span><strong>{activePlan.totals.carbs}g</strong> carbs</span><span><strong>{activePlan.totals.fat}g</strong> fat</span></div><Link className="btn btn-outline-primary w-100" to="/meal-plans">Open meal plan</Link></div> : <EmptyState title="No active plan" text={user.role === 'user' ? 'Your dietitian has not activated a plan yet.' : 'Create a plan and mark it active.'} />}
          </section>
        </div>
      </div>
    </div>
  );
}
