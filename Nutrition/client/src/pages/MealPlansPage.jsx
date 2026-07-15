import { useEffect, useState } from 'react';
import api, { apiError } from '../api/client.js';
import EmptyState from '../components/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const blankItem = () => ({ name: '', quantity: '1 serving', calories: 0, protein: 0, carbs: 0, fat: 0 });
const blankMeal = (name = 'Breakfast') => ({ name, time: '08:00', items: [blankItem()] });
const initialPlan = () => ({
  client: '', title: '', description: '', startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10), status: 'draft', meals: [blankMeal()],
});
const pretty = (value) => value.split('-').map((word) => word[0].toUpperCase() + word.slice(1)).join(' ');

export default function MealPlansPage() {
  const { user } = useAuth();
  const canManage = ['dietitian', 'admin'].includes(user.role);
  const [plans, setPlans] = useState([]);
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState(initialPlan());
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const [planRes, clientRes] = await Promise.all([api.get('/meal-plans'), api.get('/clients')]);
      setPlans(planRes.data.mealPlans); setClients(clientRes.data.clients);
    } catch (err) { setError(apiError(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const updateMeal = (mealIndex, field, value) => setForm((current) => ({ ...current, meals: current.meals.map((meal, index) => index === mealIndex ? { ...meal, [field]: value } : meal) }));
  const updateItem = (mealIndex, itemIndex, field, value) => setForm((current) => ({
    ...current,
    meals: current.meals.map((meal, index) => index === mealIndex ? {
      ...meal, items: meal.items.map((item, i) => i === itemIndex ? { ...item, [field]: value } : item),
    } : meal),
  }));
  const addMeal = () => setForm((current) => ({ ...current, meals: [...current.meals, blankMeal(`Meal ${current.meals.length + 1}`)] }));
  const removeMeal = (mealIndex) => setForm((current) => ({ ...current, meals: current.meals.filter((_, index) => index !== mealIndex) }));
  const addItem = (mealIndex) => setForm((current) => ({ ...current, meals: current.meals.map((meal, index) => index === mealIndex ? { ...meal, items: [...meal.items, blankItem()] } : meal) }));
  const removeItem = (mealIndex, itemIndex) => setForm((current) => ({ ...current, meals: current.meals.map((meal, index) => index === mealIndex ? { ...meal, items: meal.items.filter((_, i) => i !== itemIndex) } : meal) }));

  const openEdit = (plan) => {
    setEditing(plan._id);
    setForm({
      client: plan.client._id, title: plan.title, description: plan.description,
      startDate: plan.startDate.slice(0, 10), endDate: plan.endDate.slice(0, 10), status: plan.status,
      meals: plan.meals.map((meal) => ({ name: meal.name, time: meal.time, items: meal.items.map(({ name, quantity, calories, protein, carbs, fat }) => ({ name, quantity, calories, protein, carbs, fat })) })),
    });
    setOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (editing) await api.put(`/meal-plans/${editing}`, form); else await api.post('/meal-plans', form);
      setOpen(false); setEditing(null); setForm(initialPlan()); await load();
    } catch (err) { setError(apiError(err)); }
    finally { setBusy(false); }
  };

  const remove = async (plan) => {
    if (!window.confirm(`Delete “${plan.title}”?`)) return;
    try { await api.delete(`/meal-plans/${plan._id}`); await load(); } catch (err) { setError(apiError(err)); }
  };

  return (
    <div>
      <div className="page-header"><div><div className="eyebrow">NUTRITION PRESCRIPTIONS</div><h1>Meal plans</h1><p>Build structured meals and calculate nutrients automatically.</p></div>{canManage && <button className="btn btn-primary" onClick={() => { setForm(initialPlan()); setEditing(null); setOpen(true); }}><i className="bi bi-plus-lg" /> Create plan</button>}</div>
      {error && <div className="alert alert-danger">{error}</div>}

      {open && canManage && <section className="panel form-panel mb-4">
        <div className="panel-head"><div><h3>{editing ? 'Edit meal plan' : 'New meal plan'}</h3><p>Nutrient totals are calculated by the backend from every food item.</p></div><button className="icon-button" onClick={() => setOpen(false)}><i className="bi bi-x-lg" /></button></div>
        <form onSubmit={submit}>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Client</label><select required className="form-select" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })}><option value="">Select a client</option>{clients.map((client) => <option key={client._id} value={client._id}>{client.user.name} — {pretty(client.goal)}</option>)}</select></div>
            <div className="col-md-6"><label className="form-label">Plan title</label><input required minLength="3" className="form-control" placeholder="e.g. Balanced 7-day plan" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="col-md-3"><label className="form-label">Start date</label><input required type="date" className="form-control" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div className="col-md-3"><label className="form-label">End date</label><input required type="date" className="form-control" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            <div className="col-md-3"><label className="form-label">Status</label><select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{['draft', 'active', 'completed', 'archived'].map((v) => <option key={v}>{v}</option>)}</select></div>
            <div className="col-md-3"><label className="form-label">Description</label><input className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          </div>
          <div className="meal-builder">
            {form.meals.map((meal, mealIndex) => <div className="meal-block" key={mealIndex}>
              <div className="meal-block-head"><div className="d-flex gap-2 flex-grow-1"><input required className="form-control meal-name" value={meal.name} onChange={(e) => updateMeal(mealIndex, 'name', e.target.value)} /><input type="time" className="form-control meal-time" value={meal.time} onChange={(e) => updateMeal(mealIndex, 'time', e.target.value)} /></div>{form.meals.length > 1 && <button type="button" className="icon-button danger" onClick={() => removeMeal(mealIndex)}><i className="bi bi-trash3" /></button>}</div>
              <div className="food-grid labels"><span>Food item</span><span>Quantity</span><span>kcal</span><span>Protein</span><span>Carbs</span><span>Fat</span><span /></div>
              {meal.items.map((item, itemIndex) => <div className="food-grid" key={itemIndex}><input required className="form-control" placeholder="Food" value={item.name} onChange={(e) => updateItem(mealIndex, itemIndex, 'name', e.target.value)} /><input required className="form-control" placeholder="Serving" value={item.quantity} onChange={(e) => updateItem(mealIndex, itemIndex, 'quantity', e.target.value)} />{['calories', 'protein', 'carbs', 'fat'].map((field) => <input key={field} required type="number" min="0" step="0.1" className="form-control" value={item[field]} onChange={(e) => updateItem(mealIndex, itemIndex, field, e.target.value)} />)}<button type="button" className="icon-button" disabled={meal.items.length === 1} onClick={() => removeItem(mealIndex, itemIndex)}><i className="bi bi-x-lg" /></button></div>)}
              <button type="button" className="text-button" onClick={() => addItem(mealIndex)}><i className="bi bi-plus-circle" /> Add food item</button>
            </div>)}
            <button type="button" className="btn btn-light" onClick={addMeal}><i className="bi bi-plus-lg" /> Add another meal</button>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4"><button type="button" className="btn btn-light" onClick={() => setOpen(false)}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Saving plan…' : 'Save meal plan'}</button></div>
        </form>
      </section>}

      {loading ? <div className="app-loader local"><div className="spinner-border text-success" /></div> : plans.length ? <div className="plan-list">{plans.map((plan) => <section className="panel plan-card" key={plan._id}>
        <div className="plan-card-top"><div><div className={`status-pill ${plan.status}`}>{plan.status}</div><h3>{plan.title}</h3><p>{plan.client?.user?.name} · {new Date(plan.startDate).toLocaleDateString('en-IN')} – {new Date(plan.endDate).toLocaleDateString('en-IN')}</p></div>{canManage && <div><button className="icon-button" onClick={() => openEdit(plan)}><i className="bi bi-pencil" /></button><button className="icon-button danger" onClick={() => remove(plan)}><i className="bi bi-trash3" /></button></div>}</div>
        <div className="nutrition-strip"><div><span>Energy</span><strong>{plan.totals.calories} kcal</strong></div><div><span>Protein</span><strong>{plan.totals.protein} g</strong></div><div><span>Carbohydrates</span><strong>{plan.totals.carbs} g</strong></div><div><span>Fat</span><strong>{plan.totals.fat} g</strong></div></div>
        <button className="plan-toggle" onClick={() => setExpanded(expanded === plan._id ? null : plan._id)}>{expanded === plan._id ? 'Hide meals' : `View ${plan.meals.length} meals`} <i className={`bi bi-chevron-${expanded === plan._id ? 'up' : 'down'}`} /></button>
        {expanded === plan._id && <div className="meal-preview">{plan.meals.map((meal, index) => <div key={index}><div className="meal-preview-head"><strong>{meal.name}</strong><span>{meal.time}</span></div>{meal.items.map((item, i) => <div className="food-preview" key={i}><span>{item.name}<small>{item.quantity}</small></span><strong>{item.calories} kcal</strong></div>)}</div>)}</div>}
      </section>)}</div> : <section className="panel"><EmptyState icon="bi-journal-medical" title="No meal plans yet" text={canManage ? 'Create a structured plan for one of your clients.' : 'Your dietitian will publish your meal plan here.'} /></section>}
    </div>
  );
}
