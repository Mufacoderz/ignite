import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Plus, X, Pencil, Trash2, Dumbbell,  Layers } from 'lucide-react';

const CATEGORIES = ['strength','cardio','flexibility','balance'];
const MUSCLES = ['Chest','Back','Shoulders','Biceps','Triceps','Core','Legs','Glutes','Full Body'];

function ExerciseModal({ exercise, onClose, onSave }) {
  const [form, setForm] = useState(exercise || { name:'', muscle_group:'', category:'strength', sets:3, reps:10, notes:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = e => setForm({...form, [e.target.name]: e.target.value});

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (exercise?.id) {
        await api.put(`/exercises/${exercise.id}`, form);
      } else {
        await api.post('/exercises', form);
      }
      onSave();
    } catch(err) {
      setError(err.response?.data?.message || 'Error saving.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">{exercise?.id ? 'EDIT EXERCISE' : 'NEW EXERCISE'}</div>
          <button className="modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Exercise Name *</label>
              <input className="form-input" name="name" placeholder="e.g. Bench Press" value={form.name} onChange={handle} required />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" name="category" value={form.category} onChange={handle}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Muscle Group</label>
                <select className="form-select" name="muscle_group" value={form.muscle_group} onChange={handle}>
                  <option value="">Select...</option>
                  {MUSCLES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Sets</label>
                <input className="form-input" name="sets" type="number" min="1" value={form.sets} onChange={handle} />
              </div>
              <div className="form-group">
                <label className="form-label">Reps</label>
                <input className="form-input" name="reps" type="number" min="1" value={form.reps} onChange={handle} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" name="notes" placeholder="Any tips, variations..." value={form.notes} onChange={handle} />
            </div>
            <div style={{display:'flex', gap:'10px', justifyContent:'flex-end'}}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : exercise?.id ? 'Save Changes' : 'Add Exercise'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  const load = async () => {
    setLoading(true);
    try { const res = await api.get('/exercises'); setExercises(res.data); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this exercise?')) return;
    await api.delete(`/exercises/${id}`);
    load();
  };

  const filtered = exercises.filter(ex => {
    const matchSearch = ex.name.toLowerCase().includes(search.toLowerCase()) ||
      (ex.muscle_group || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || ex.category === filterCat;
    return matchSearch && matchCat;
  });

  const tagClass = cat => ({strength:'tag-strength',cardio:'tag-cardio',flexibility:'tag-flexibility',balance:'tag-balance'}[cat] || '');

  return (
    <div className="animate-in">
      <div className="page-header" style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between'}}>
        <div>
          <div className="page-title">EXERCISES</div>
          <p className="page-subtitle">Your personal exercise library — {exercises.length} exercises</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <Plus size={16} /> Add Exercise
        </button>
      </div>

      {/* Filters */}
      <div style={{display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap'}}>
        <input className="form-input" style={{maxWidth:'260px'}} placeholder="Search exercises..." value={search} onChange={e => setSearch(e.target.value)} />
        <div className="tabs" style={{marginBottom:0, flex:1, maxWidth:'400px'}}>
          {['all', ...CATEGORIES].map(cat => (
            <button key={cat} className={`tab-btn ${filterCat === cat ? 'active' : ''}`} onClick={() => setFilterCat(cat)}>
              {cat.charAt(0).toUpperCase()+cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="loader" /> : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💪</div>
          <div className="empty-title">NO EXERCISES YET</div>
          <div className="empty-desc">Start by adding your first exercise to the library.</div>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
            <Plus size={16} /> Add First Exercise
          </button>
        </div>
      ) : (
        <div className="exercise-grid">
          {filtered.map(ex => (
            <div key={ex.id} className="exercise-card animate-in">
              <div className="exercise-name">{ex.name}</div>
              <div className="exercise-meta">
                <span className={`tag ${tagClass(ex.category)}`}>{ex.category}</span>
                {ex.muscle_group && <span className="tag tag-muscle">{ex.muscle_group}</span>}
              </div>
              <div className="exercise-stats">
                <div className="exercise-stat-item"><Layers size={13} />{ex.sets} sets</div>
                <div className="exercise-stat-item">× {ex.reps} reps</div>
              </div>
              {ex.notes && <p style={{fontSize:'13px', color:'var(--text-muted)', marginTop:'8px', lineHeight:'1.4'}}>{ex.notes}</p>}
              <div className="exercise-actions">
                <button className="btn btn-sm btn-secondary" onClick={() => { setEditing(ex); setShowModal(true); }}>
                  <Pencil size={13} /> Edit
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ex.id)}>
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ExerciseModal
          exercise={editing}
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); load(); }}
        />
      )}
    </div>
  );
}
