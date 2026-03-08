import { useEffect, useState } from 'react';
import api from '../utils/api';
import { CheckCircle2, Plus, X, Trash2, Zap } from 'lucide-react';

function AddExerciseModal({ exercises, date, onClose, onAdded }) {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggle = id => setSelected(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id]);

  const add = async () => {
    setLoading(true);
    for (const id of selected) {
      try { await api.post('/checklist', { exercise_id: id, date }); } catch { }
    }
    setLoading(false); onAdded();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">ADD EXERCISES</div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>Select exercises to add to today's checklist ({selected.length} selected)</p>
          {exercises.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No exercises in library. Add some first!</p>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {exercises.map(ex => (
                <label key={ex.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                  background: selected.includes(ex.id) ? 'var(--bg-warm)' : 'var(--bg)',
                  border: `1.5px solid ${selected.includes(ex.id) ? 'var(--border-warm)' : 'var(--border)'}`,
                  borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s'
                }}>
                  <input type="checkbox" checked={selected.includes(ex.id)} onChange={() => toggle(ex.id)}
                    style={{ accentColor: 'var(--orange)', width: '16px', height: '16px' }} />
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{ex.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ex.sets} sets × {ex.reps} reps • {ex.category}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={add} disabled={!selected.length || loading}>
              {loading ? 'Adding...' : `Add ${selected.length} Exercise${selected.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChecklistPage() {
  const [checklist, setChecklist] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const getLast7 = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { date: d.toISOString().split('T')[0], day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()], num: d.getDate() };
    });
  };

  const days = getLast7();

  const load = async () => {
    setLoading(true);
    try {
      const [c, e, p] = await Promise.all([
        api.get(`/checklist?date=${selectedDate}`),
        api.get('/exercises'),
        api.get('/plans')
      ]);
      setChecklist(c.data); setExercises(e.data); setPlans(p.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [selectedDate]);

  const toggle = async (id) => {
    const item = checklist.find(i => i.id === id);
    if (!item) return;
    setChecklist(c => c.map(i => i.id === id ? { ...i, is_completed: !i.is_completed } : i));
    try { await api.patch(`/checklist/${id}/toggle`); }
    catch { load(); }
  };

  const remove = async (id) => {
    await api.delete(`/checklist/${id}`);
    setChecklist(c => c.filter(i => i.id !== id));
  };

  const loadPlan = async (planId) => {
    await api.post('/checklist/from-plan', { plan_id: planId, date: selectedDate });
    load();
  };

  const completed = checklist.filter(i => i.is_completed).length;
  const total = checklist.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title">DAILY CHECKLIST</div>
        <p className="page-subtitle">Track your workout progress day by day</p>
      </div>

      {/* Date Strip */}
      <div className="date-strip">
        {days.map(d => (
          <div key={d.date} className={`date-pill ${selectedDate === d.date ? 'active' : ''}`} onClick={() => setSelectedDate(d.date)}>
            <div className="dp-day">{d.day}</div>
            <div className="dp-num">{d.num}</div>
          </div>
        ))}
      </div>

      {/* Progress Summary */}
      {total > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '1px' }}>
                  {pct === 100 ? '🔥 COMPLETED!' : `${pct}% DONE`}
                </span>
                <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--orange)' }}>{completed}/{total}</span>
              </div>
              <div className="progress-bar-wrap" style={{ height: '14px' }}>
                <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
            {pct === 100 && <Zap size={36} color="var(--orange)" />}
          </div>
        </div>
      )}

      {/* Actions bar */}
      {!loading && checklist.length > 0 && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add Exercise
          </button>
          {plans.length > 0 && (
            <select className="form-select" style={{ width: 'auto', minWidth: '200px' }}
              onChange={e => { if (e.target.value) { loadPlan(e.target.value); e.target.value = ''; } }}>
              <option value="">📋 Load from plan...</option>
              {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
        </div>
      )}

      {/* Checklist */}
      {loading ? <div className="loader" /> : checklist.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <div className="empty-title">NO EXERCISES TODAY</div>
          <div className="empty-desc">Add exercises individually or load a workout plan to get started.</div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add Exercise
          </button>
        </div>
      ) : (
        <div>
          {checklist.map(item => (
            <div key={item.id} className={`checklist-item animate-in ${item.is_completed ? 'completed' : ''}`}>
              <button className={`check-btn ${item.is_completed ? 'checked' : ''}`} onClick={() => toggle(item.id)}>
                {item.is_completed && <CheckCircle2 size={14} color="white" />}
              </button>
              <div className="checklist-info">
                <div className="checklist-name">{item.exercise_name}</div>
                <div className="checklist-sub">
                  {item.category} • {item.sets} sets × {item.reps} reps
                  {item.duration_minutes && ` • ${item.duration_minutes}min`}
                  {item.muscle_group && ` • ${item.muscle_group}`}
                </div>
              </div>
              {item.is_completed && (
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#16A34A', background: '#DCFCE7', padding: '3px 10px', borderRadius: '100px' }}>DONE</span>
              )}
              <button className="btn btn-sm btn-danger" onClick={() => remove(item.id)} style={{ padding: '6px', minWidth: '32px', justifyContent: 'center' }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddExerciseModal
          exercises={exercises}
          date={selectedDate}
          onClose={() => setShowAdd(false)}
          onAdded={() => { setShowAdd(false); load(); }}
        />
      )}
    </div>
  );
}
