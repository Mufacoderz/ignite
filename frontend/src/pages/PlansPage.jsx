import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, X, Trash2, Pencil, CalendarDays, Dumbbell, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function PlanModal({ plan, exercises, onClose, onSave }) {
  const [form, setForm] = useState({
    name: plan?.name || '',
    description: plan?.description || '',
    scheduled_date: plan?.scheduled_date?.split('T')[0] || '',
    day_of_week: plan?.day_of_week || '',
    exercise_ids: plan?.exercises?.map(e => e.exercise_id) || []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleEx = id => {
    setForm(f => ({...f, exercise_ids: f.exercise_ids.includes(id)
      ? f.exercise_ids.filter(i => i !== id)
      : [...f.exercise_ids, id]
    }));
  };

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (plan?.id) await api.put(`/plans/${plan.id}`, form);
      else await api.post('/plans', form);
      onSave();
    } catch(err) {
      setError(err.response?.data?.message || 'Error saving.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{plan?.id ? 'EDIT PLAN' : 'NEW PLAN'}</div>
          <button className="modal-close" onClick={onClose}><X size={16}/></button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Plan Name *</label>
              <input className="form-input" placeholder="e.g. Push Day, Leg Day..." value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Optional description..." value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Scheduled Date</label>
                <input className="form-input" type="date" value={form.scheduled_date} onChange={e => setForm({...form, scheduled_date: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Day of Week</label>
                <select className="form-select" value={form.day_of_week} onChange={e => setForm({...form, day_of_week: e.target.value})}>
                  <option value="">Any day</option>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Select Exercises ({form.exercise_ids.length} selected)</label>
              {exercises.length === 0 ? (
                <p style={{fontSize:'13px', color:'var(--text-muted)'}}>No exercises yet. Add some first!</p>
              ) : (
                <div style={{maxHeight:'200px', overflowY:'auto', border:'1.5px solid var(--border)', borderRadius:'10px', padding:'8px'}}>
                  {exercises.map(ex => (
                    <label key={ex.id} style={{display:'flex', alignItems:'center', gap:'10px', padding:'8px', cursor:'pointer', borderRadius:'8px', transition:'background 0.15s'}}
                      onMouseEnter={e => e.currentTarget.style.background='var(--bg)'}
                      onMouseLeave={e => e.currentTarget.style.background='none'}>
                      <input type="checkbox" checked={form.exercise_ids.includes(ex.id)} onChange={() => toggleEx(ex.id)}
                        style={{accentColor:'var(--orange)', width:'16px', height:'16px'}} />
                      <span style={{fontSize:'14px', fontWeight:'600'}}>{ex.name}</span>
                      <span style={{fontSize:'12px', color:'var(--text-muted)', marginLeft:'auto'}}>{ex.category}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div style={{display:'flex', gap:'10px', justifyContent:'flex-end'}}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : plan?.id ? 'Save Changes' : 'Create Plan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const [p, e] = await Promise.all([api.get('/plans'), api.get('/exercises')]);
      setPlans(p.data); setExercises(e.data);
    } catch(err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this plan?')) return;
    await api.delete(`/plans/${id}`); load();
  };

  const startWorkout = async (plan) => {
    const today = new Date().toISOString().split('T')[0];
    await api.post('/checklist/from-plan', { plan_id: plan.id, date: today });
    navigate('/checklist');
  };

  return (
    <div className="animate-in">
      <div className="page-header" style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between'}}>
        <div>
          <div className="page-title">WORKOUT PLANS</div>
          <p className="page-subtitle">Custom schedules — {plans.length} plans</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <Plus size={16} /> New Plan
        </button>
      </div>

      {loading ? <div className="loader" /> : plans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-title">NO PLANS YET</div>
          <div className="empty-desc">Create your first workout plan and assign exercises to it.</div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
            <Plus size={16} /> Create First Plan
          </button>
        </div>
      ) : (
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'16px'}}>
          {plans.map(plan => (
            <div key={plan.id} className="plan-card animate-in">
              <div className="plan-header">
                <div className="plan-name">{plan.name}</div>
                {plan.description && <div className="plan-desc">{plan.description}</div>}
                <div style={{display:'flex', gap:'8px', marginTop:'8px', flexWrap:'wrap'}}>
                  {plan.scheduled_date && (
                    <span style={{fontSize:'12px', background:'rgba(255,255,255,0.15)', padding:'3px 10px', borderRadius:'100px', display:'flex', alignItems:'center', gap:'4px'}}>
                      <CalendarDays size={12}/>{new Date(plan.scheduled_date).toLocaleDateString()}
                    </span>
                  )}
                  {plan.day_of_week && (
                    <span style={{fontSize:'12px', background:'rgba(255,255,255,0.15)', padding:'3px 10px', borderRadius:'100px'}}>{plan.day_of_week}</span>
                  )}
                </div>
              </div>
              <div className="plan-body">
                <div className="plan-exercise-count"><Dumbbell size={14} style={{display:'inline', marginRight:'4px'}} />{plan.exercises?.length || 0} exercises</div>
                <div style={{display:'flex', flexWrap:'wrap'}}>
                  {plan.exercises?.slice(0,5).map(ex => (
                    <span key={ex.id} className="plan-ex-pill">{ex.name}</span>
                  ))}
                  {(plan.exercises?.length || 0) > 5 && (
                    <span className="plan-ex-pill" style={{color:'var(--text-muted)'}}>+{plan.exercises.length - 5} more</span>
                  )}
                </div>
              </div>
              <div className="plan-footer">
                <button className="btn btn-primary btn-sm" onClick={() => startWorkout(plan)}>
                  <PlayCircle size={14} /> Start Today
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(plan); setShowModal(true); }}>
                  <Pencil size={13} /> Edit
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(plan.id)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <PlanModal
          plan={editing}
          exercises={exercises}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
