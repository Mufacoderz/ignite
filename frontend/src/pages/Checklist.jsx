import { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from '../components/Toast';

const today = new Date().toISOString().split('T')[0];
const fmt = (d) => new Date(d).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });

export default function Checklist() {
  const [date, setDate] = useState(today);
  const [checklist, setChecklist] = useState([]);
  const [plans, setPlans] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedEx, setSelectedEx] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [c, p, e] = await Promise.all([
        api.get(`/checklist/${date}`),
        api.get('/plans'),
        api.get('/exercises')
      ]);
      setChecklist(c.data); setPlans(p.data); setExercises(e.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [date]);

  const toggle = async (item) => {
    try {
      await api.patch(`/checklist/${item.id}/toggle`);
      setChecklist(prev => prev.map(i => i.id === item.id ? {...i, completed: !i.completed} : i));
    } catch { toast('Gagal update', 'error'); }
  };

  const removeItem = async (id) => {
    await api.delete(`/checklist/${id}`);
    setChecklist(prev => prev.filter(i => i.id !== id));
    toast('Dihapus dari checklist', 'success');
  };

  const loadPlan = async () => {
    if (!selectedPlan) return;
    try {
      await api.post('/checklist/load-plan', { plan_id: selectedPlan, date });
      load(); setSelectedPlan('');
      toast('Plan dimuat ke checklist!', 'success');
    } catch (err) { toast(err.response?.data?.error || 'Gagal', 'error'); }
  };

  const addExercise = async () => {
    if (!selectedEx) return;
    try {
      await api.post('/checklist', { exercise_id: selectedEx, date });
      load(); setSelectedEx('');
      toast('Exercise ditambahkan!', 'success');
    } catch (err) { toast(err.response?.data?.error || 'Sudah ada di checklist', 'error'); }
  };

  const completed = checklist.filter(i => i.completed).length;
  const total = checklist.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 className="page-header">Daily Checklist</h1>
          <p className="page-sub">Pantau progress workout harian</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="date" className="input" style={{ width: 'auto' }} value={date} onChange={e => setDate(e.target.value)} max={today} />
          <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>+ Tambah</button>
        </div>
      </div>

      {/* Add Panel */}
      {showAdd && (
        <div className="card" style={{ padding: 20, marginBottom: 20, background: 'linear-gradient(135deg, #FFF9F9, #FFF3EE)' }}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Tambah ke Checklist — {fmt(date)}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto', gap: 10, alignItems: 'end' }}>
            <div className="form-group">
              <label className="form-label">Muat dari Plan</label>
              <select className="input" value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)}>
                <option value="">Pilih plan...</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <button className="btn btn-primary btn-sm" onClick={loadPlan} disabled={!selectedPlan}>Muat Plan</button>
            <div className="form-group">
              <label className="form-label">Tambah Exercise Manual</label>
              <select className="input" value={selectedEx} onChange={e => setSelectedEx(e.target.value)}>
                <option value="">Pilih exercise...</option>
                {exercises.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={addExercise} disabled={!selectedEx}>+ Tambah</button>
          </div>
        </div>
      )}

      {/* Progress */}
      {total > 0 && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: 36, background: 'linear-gradient(135deg, #D92B2B, #FF6B35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{pct}%</span>
              <span style={{ fontSize: 14, color: '#9E9087', marginLeft: 8 }}>({completed}/{total} selesai)</span>
            </div>
            {pct === 100 && <div style={{ background: '#F0FDF4', color: '#16A34A', padding: '6px 14px', borderRadius: 8, fontWeight: 700, fontSize: 14 }}>🎉 Semua Selesai!</div>}
          </div>
          <div className="progress-bar" style={{ height: 12 }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* Checklist Items */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#9E9087' }}>Memuat...</div>
      ) : checklist.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h3>Tidak ada exercise untuk hari ini</h3>
          <p>Muat dari workout plan atau tambah exercise manual</p>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Tambah Exercise</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {checklist.map(item => (
            <div key={item.id} className="card" style={{
              padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
              opacity: item.completed ? 0.7 : 1,
              borderLeft: item.completed ? '4px solid #16A34A' : '4px solid #F2EDE8',
              transition: 'all 0.2s'
            }}>
              {/* Checkbox */}
              <div onClick={() => toggle(item)} style={{
                width: 26, height: 26, borderRadius: 8, border: '2.5px solid',
                borderColor: item.completed ? '#16A34A' : '#D92B2B',
                background: item.completed ? '#16A34A' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, color: 'white', cursor: 'pointer', flexShrink: 0,
                transition: 'all 0.15s'
              }}>{item.completed ? '✓' : ''}</div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? '#9E9087' : '#2D2825' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 12, color: '#9E9087', display: 'flex', gap: 12, marginTop: 2 }}>
                  <span>💪 {item.sets} sets × {item.reps} reps</span>
                  {item.muscle_group && <span>🎯 {item.muscle_group}</span>}
                  {item.category && <span>📂 {item.category}</span>}
                </div>
              </div>

              {item.completed && item.completed_at && (
                <div style={{ fontSize: 12, color: '#16A34A', fontWeight: 600 }}>
                  ✓ {new Date(item.completed_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}

              <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: '#E4DDD5', cursor: 'pointer', fontSize: 16, padding: 4 }} title="Hapus">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
