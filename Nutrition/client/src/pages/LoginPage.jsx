import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { apiError } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const demos = [
  ['Admin', 'admin@nutrition.local'],
  ['Dietitian', 'dietitian@nutrition.local'],
  ['User', 'user@nutrition.local'],
];

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: 'user@nutrition.local', password: 'Demo@123' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) { setError(apiError(err)); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div className="auth-visual-content">
          <div className="eyebrow light">SMART WELLNESS MANAGEMENT</div>
          <h1>Better nutrition starts with a plan you can actually follow.</h1>
          <p>Connect dietitians and clients through practical meal planning, nutrient insights and measurable progress.</p>
          <div className="visual-metrics">
            <span><strong>3</strong> role-based experiences</span>
            <span><strong>100%</strong> personalized plans</span>
          </div>
        </div>
        <div className="leaf leaf-one" /><div className="leaf leaf-two" />
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <div className="brand auth-brand"><div className="brand-mark"><i className="bi bi-flower1" /></div><div><strong>Nutrition</strong><span>Assistant</span></div></div>
          <div className="eyebrow">WELCOME BACK</div>
          <h2>Sign in to your workspace</h2>
          <p className="text-secondary">Manage plans, clients and daily progress in one place.</p>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={submit} className="mt-4">
            <label className="form-label">Email address</label>
            <div className="input-icon"><i className="bi bi-envelope" /><input className="form-control" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <label className="form-label mt-3">Password</label>
            <div className="input-icon"><i className="bi bi-lock" /><input className="form-control" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <button className="btn btn-primary w-100 mt-4" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'} <i className="bi bi-arrow-right" /></button>
          </form>
          <div className="demo-logins">
            <span>Demo login</span>
            <div>{demos.map(([label, email]) => <button key={email} onClick={() => setForm({ email, password: 'Demo@123' })}>{label}</button>)}</div>
          </div>
          <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
        </div>
      </section>
    </div>
  );
}
