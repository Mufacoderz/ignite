import { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from '../components/Toast';

const CATEGORIES = ['General','Strength','Cardio','Flexibility','HIIT','Sports','Recovery'];
const MUSCLES = ['Full Body','Chest','Back','Shoulders','Arms','Core','Legs','Glutes','Calves'];

function ExerciseModal({ exercise, onClose, onSave }) {
  const [form, setForm] = useState(exercise || { name: '', category: 'General', muscle_group: '', sets: 3, reps: 10, duration_min: 0, notes: '' });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name) return toast('Nama exercise wajib diisi', 'error');
    setLoading(true);
    try {
      if (exercise?.id) await api.put(`/exercises/${exercise.id}`, form);
      else await api.post('/exercises', form);
      onSave(); onClose();
      toast(exercise?.id ? 'Exercise diperbarui!' : 'Exercise ditambahkan!', 'success');
    } catch (err) { toast(err.response?.data?.error || 'Gagal menyimpan', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h2 className="modal-title">{exercise?.id ? 'Edit Exercise' : 'Tambah Exercise'}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label">Nama Exercise *</label>
            <input className="input" placeholder="e.g. Push Up" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Kategori</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Otot Utama</label>
              <select className="input" value={form.muscle_group} onChange={e => set('muscle_group', e.target.value)}>
                <option value="">Pilih...</option>
                {MUSCLES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Sets</label>
              <input className="input" type="number" min={1} value={form.sets} onChange={e => set('sets', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Reps</label>
              <input className="input" type="number" min={1} value={form.reps} onChange={e => set('reps', +e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Durasi (menit, opsional)</label>
            <input className="input" type="number" min={0} value={form.duration_min} onChange={e => set('duration_min', +e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Catatan</label>
            <textarea className="input" rows={3} placeholder="Tips, instruksi, dll..." value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? 'Menyimpan...' : '💾 Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');

  const load = async () => {
    setLoading(true);
    try { const { data } = await api.get('/exercises'); setExercises(data); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Hapus exercise ini?')) return;
    try { await api.delete(`/exercises/${id}`); load(); toast('Exercise dihapus', 'success'); }
    catch { toast('Gagal menghapus', 'error'); }
  };

  const filtered = exercises.filter(e =>
    (!search || e.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filterCat || e.category === filterCat)
  );

  const catColors = { Strength: '#D92B2B', Cardio: '#FF6B35', HIIT: '#E67E22', Flexibility: '#16A34A', Sports: '#2563EB', Recovery: '#7C3AED', General: '#9E9087' };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 className="page-header">Exercise Library</h1>
          <p className="page-sub">{exercises.length} exercise tersimpan</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>+ Tambah Exercise</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="input" style={{ maxWidth: 260 }} placeholder="🔍 Cari exercise..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input" style={{ maxWidth: 180 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">Semua Kategori</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9E9087' }}>Memuat...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💪</div>
          <h3>Belum ada exercise</h3>
          <p>Tambahkan exercise pertamamu ke library</p>
          <button className="btn btn-primary" onClick={() => setModal({})}>+ Tambah Exercise</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(ex => (
            <div key={ex.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, textTransform: 'uppercase', color: '#2D2825', letterSpacing: '0.03em' }}>{ex.name}</h3>
                  {ex.muscle_group && <div style={{ fontSize: 12, color: '#9E9087' }}>{ex.muscle_group}</div>}
                </div>
                <span className="badge" style={{ background: `${catColors[ex.category] || '#9E9087'}15`, color: catColors[ex.category] || '#9E9087', fontSize: 11 }}>{ex.category}</span>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ background: '#FAF9F7', borderRadius: 8, padding: '6px 12px', textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 18, fontFamily: 'Barlow Condensed', fontWeight: 800, color: '#D92B2B' }}>{ex.sets}</div>
                  <div style={{ fontSize: 11, color: '#9E9087' }}>SETS</div>
                </div>
                <div style={{ background: '#FAF9F7', borderRadius: 8, padding: '6px 12px', textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: 18, fontFamily: 'Barlow Condensed', fontWeight: 800, color: '#FF6B35' }}>{ex.reps}</div>
                  <div style={{ fontSize: 11, color: '#9E9087' }}>REPS</div>
                </div>
                {ex.duration_min > 0 && (
                  <div style={{ background: '#FAF9F7', borderRadius: 8, padding: '6px 12px', textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 18, fontFamily: 'Barlow Condensed', fontWeight: 800, color: '#E67E22' }}>{ex.duration_min}</div>
                    <div style={{ fontSize: 11, color: '#9E9087' }}>MENIT</div>
                  </div>
                )}
              </div>
              {ex.notes && <p style={{ fontSize: 13, color: '#9E9087', marginBottom: 14, borderTop: '1px solid #F2EDE8', paddingTop: 10 }}>{ex.notes}</p>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setModal(ex)}>✏️ Edit</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ex.id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && <ExerciseModal exercise={modal.id ? modal : null} onClose={() => setModal(null)} onSave={load} />}
    </div>
  );
}
