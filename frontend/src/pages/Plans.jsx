import { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from '../components/Toast';

const DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];

function PlanModal({ plan, exercises, onClose, onSave }) {
  const [form, setForm] = useState(plan ? { ...plan, schedule_days: plan.schedule_days ? JSON.parse(plan.schedule_days || '[]') : [] } : { name: '', description: '', schedule_days: [], exercises: [] });
  const [selectedExs, setSelectedExs] = useState(plan?.exercises || []);
  const [loading, setLoading] = useState(false);

  const toggleDay = (day) => {
    setForm(f => ({
      ...f,
      schedule_days: f.schedule_days.includes(day)
        ? f.schedule_days.filter(d => d !== day)
        : [...f.schedule_days, day]
    }));
  };

  const toggleExercise = (ex) => {
    setSelectedExs(prev => {
      const exists = prev.find(e => e.exercise_id === ex.id || e.id === ex.id);
      if (exists) return prev.filter(e => (e.exercise_id || e.id) !== ex.id);
      return [...prev, { exercise_id: ex.id, name: ex.name }];
    });
  };

  const handleSave = async () => {
    if (!form.name) return toast('Nama plan wajib diisi', 'error');
    setLoading(true);
    try {
      const payload = { ...form, exercises: selectedExs.map(e => ({ exercise_id: e.exercise_id || e.id })) };
      if (plan?.id) await api.put(`/plans/${plan.id}`, payload);
      else await api.post('/plans', payload);
      onSave(); onClose();
      toast(plan?.id ? 'Plan diperbarui!' : 'Plan dibuat!', 'success');
    } catch (err) { toast(err.response?.data?.error || 'Gagal', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 600 }}>
        <h2 className="modal-title">{plan?.id ? 'Edit Plan' : 'Buat Workout Plan'}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Nama Plan *</label>
            <input className="input" placeholder="e.g. Push Day, Full Body" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea className="input" rows={2} placeholder="Opsional..." value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} style={{ resize: 'vertical' }} />
          </div>
          <div className="form-group">
            <label className="form-label">Jadwal Hari</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {DAYS.map(day => (
                <button key={day} type="button" onClick={() => toggleDay(day)} style={{
                  padding: '6px 14px', borderRadius: 8, border: '1.5px solid',
                  borderColor: form.schedule_days.includes(day) ? '#D92B2B' : '#E4DDD5',
                  background: form.schedule_days.includes(day) ? '#FEE' : 'white',
                  color: form.schedule_days.includes(day) ? '#D92B2B' : '#5C544D',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}>{day}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Pilih Exercise ({selectedExs.length} dipilih)</label>
            <div style={{ maxHeight: 220, overflow: 'auto', border: '1.5px solid #E4DDD5', borderRadius: 8, padding: 8 }}>
              {exercises.length === 0 ? (
                <div style={{ padding: 12, color: '#9E9087', fontSize: 13, textAlign: 'center' }}>Belum ada exercise. Buat dulu di halaman Exercise.</div>
              ) : exercises.map(ex => {
                const selected = selectedExs.some(e => (e.exercise_id || e.id) === ex.id);
                return (
                  <div key={ex.id} onClick={() => toggleExercise(ex)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                    borderRadius: 6, cursor: 'pointer', marginBottom: 4,
                    background: selected ? '#FEE' : 'transparent'
                  }}>
                    <div style={{ width: 18, height: 18, borderRadius: 5, border: '2px solid', borderColor: selected ? '#D92B2B' : '#E4DDD5', background: selected ? '#D92B2B' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white', flexShrink: 0 }}>{selected ? '✓' : ''}</div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: selected ? '#D92B2B' : '#2D2825' }}>{ex.name}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9E9087' }}>{ex.sets}x{ex.reps}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Menyimpan...' : '💾 Simpan Plan'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [p, e] = await Promise.all([api.get('/plans'), api.get('/exercises')]);
      setPlans(p.data); setExercises(e.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Hapus plan ini?')) return;
    await api.delete(`/plans/${id}`);
    load(); toast('Plan dihapus', 'success');
  };

  const DAYS = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 className="page-header">Workout Plans</h1>
          <p className="page-sub">{plans.length} plan aktif</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>+ Buat Plan</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9E9087' }}>Memuat...</div>
      ) : plans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>Belum ada workout plan</h3>
          <p>Buat plan pertamamu dan atur jadwal latihan</p>
          <button className="btn btn-primary" onClick={() => setModal({})}>+ Buat Plan</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {plans.map(plan => {
            const days = (() => { try { return JSON.parse(plan.schedule_days || '[]'); } catch { return []; } })();
            return (
              <div key={plan.id} className="card" style={{ padding: 22 }}>
                <div style={{ marginBottom: 12 }}>
                  <h3 style={{ fontSize: 20, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#2D2825', marginBottom: 4 }}>{plan.name}</h3>
                  {plan.description && <p style={{ fontSize: 13, color: '#9E9087' }}>{plan.description}</p>}
                </div>
                {days.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
                    {DAYS.map(d => (
                      <span key={d} style={{ padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, background: days.includes(d) ? '#FEE' : '#F2EDE8', color: days.includes(d) ? '#D92B2B' : '#C4B8B0' }}>{d.slice(0,3)}</span>
                    ))}
                  </div>
                )}
                <div style={{ borderTop: '1px solid #F2EDE8', paddingTop: 12, marginBottom: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9E9087', marginBottom: 8 }}>
                    {plan.exercises?.length || 0} Exercise
                  </div>
                  {plan.exercises?.slice(0, 4).map(ex => (
                    <div key={ex.id} style={{ fontSize: 13, padding: '4px 0', color: '#5C544D', borderBottom: '1px solid #F2EDE8', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{ex.name}</span>
                      <span style={{ color: '#9E9087' }}>{ex.custom_sets || ex.sets}×{ex.custom_reps || ex.reps}</span>
                    </div>
                  ))}
                  {(plan.exercises?.length || 0) > 4 && <div style={{ fontSize: 12, color: '#9E9087', paddingTop: 6 }}>+{plan.exercises.length - 4} lainnya</div>}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => setModal(plan)}>✏️ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(plan.id)}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal !== null && <PlanModal plan={modal.id ? modal : null} exercises={exercises} onClose={() => setModal(null)} onSave={load} />}
    </div>
  );
}
