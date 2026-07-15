import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { apiError } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const data = await register(form);
      if (data.token) navigate('/'); else setMessage(data.message);
    } catch (err) { setError(apiError(err)); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-page reverse">
      <section className="auth-panel">
        <div className="auth-card">
          <div className="brand auth-brand"><div className="brand-mark"><i className="bi bi-flower1" /></div><div><strong>Nutrition</strong><span>Assistant</span></div></div>
          <div className="eyebrow">GET STARTED</div>
          <h2>Create your wellness account</h2>
          <p className="text-secondary">Choose the workspace that matches your role.</p>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          {message && <div className="alert alert-success py-2">{message} <Link to="/login">Return to sign in</Link></div>}
          <form onSubmit={submit} className="mt-3">
            <label className="form-label">Full name</label>
            <input className="form-control" required minLength="2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <label className="form-label mt-3">Email address</label>
            <input className="form-control" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <label className="form-label mt-3">Password</label>
            <input className="form-control" type="password" minLength="8" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <label className="form-label mt-3">I am a</label>
            <div className="role-selector">
              {['user', 'dietitian'].map((role) => <button type="button" className={form.role === role ? 'selected' : ''} key={role} onClick={() => setForm({ ...form, role })}><i className={`bi ${role === 'user' ? 'bi-person-heart' : 'bi-clipboard2-pulse'}`} />{role === 'user' ? 'Wellness user' : 'Dietitian'}</button>)}
            </div>
            <button className="btn btn-primary w-100 mt-4" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
          </form>
          <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
        </div>
      </section>
      <section className="auth-visual alt"><div className="auth-visual-content"><div className="eyebrow light">PERSONALIZED CARE</div><h1>One workspace. Every nutrition journey.</h1><p>Turn goals into structured meal plans, simple daily tracking and insights that make progress visible.</p></div></section>
    </div>
  );
}
