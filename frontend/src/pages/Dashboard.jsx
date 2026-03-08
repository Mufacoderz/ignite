import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const today = new Date().toISOString().split('T')[0];
const dayNames = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayChecklist, setTodayChecklist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/stats/summary'),
      api.get(`/checklist/${today}`)
    ]).then(([s, c]) => {
      setStats(s.data);
      setTodayChecklist(c.data);
    }).finally(() => setLoading(false));
  }, []);

  const completedToday = todayChecklist.filter(i => i.completed).length;
  const totalToday = todayChecklist.length;
  const progressPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Selamat Pagi' : now.getHours() < 18 ? 'Selamat Siang' : 'Selamat Malam';

  const toggleItem = async (item) => {
    await api.patch(`/checklist/${item.id}/toggle`);
    setTodayChecklist(prev => prev.map(i => i.id === item.id ? {...i, completed: !i.completed} : i));
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 14, color: '#9E9087', marginBottom: 4 }}>
          {dayNames[now.getDay()]}, {now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <h1 className="page-header">{greeting}, {user?.name?.split(' ')[0]}! 💪</h1>
        <p className="page-sub">Siap untuk workout hari ini?</p>
      </div>

      {/* Stat Cards */}
      {!loading && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Streak', value: `${stats.streak}🔥`, sub: 'hari berturut' },
            { label: 'Workout Days', value: stats.workout_days, sub: 'total hari aktif' },
            { label: 'Exercises', value: stats.total_exercises, sub: 'exercise dibuat' },
            { label: 'Week Rate', value: `${stats.completionRate}%`, sub: 'completion minggu ini' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: '20px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9E9087', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 32, fontFamily: 'Barlow Condensed', fontWeight: 900, background: 'linear-gradient(135deg, #D92B2B, #FF6B35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#9E9087' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Today's Checklist Preview */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 18 }}>Checklist Hari Ini</h3>
            <Link to="/checklist" className="btn btn-sm btn-secondary">Lihat Semua</Link>
          </div>
          {totalToday > 0 ? (
            <>
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#9E9087', marginBottom: 6 }}>
                  <span>{completedToday} / {totalToday} selesai</span>
                  <span style={{ fontWeight: 700, color: progressPct === 100 ? '#16A34A' : '#FF6B35' }}>{progressPct}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${progressPct}%` }} /></div>
              </div>
              {todayChecklist.slice(0, 5).map(item => (
                <div key={item.id} onClick={() => toggleItem(item)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                  borderBottom: '1px solid #F2EDE8', cursor: 'pointer',
                  opacity: item.completed ? 0.6 : 1
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 6, border: '2px solid',
                    borderColor: item.completed ? '#16A34A' : '#E4DDD5',
                    background: item.completed ? '#16A34A' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: 'white', flexShrink: 0
                  }}>{item.completed ? '✓' : ''}</div>
                  <span style={{ fontSize: 14, textDecoration: item.completed ? 'line-through' : 'none', color: item.completed ? '#9E9087' : '#2D2825' }}>
                    {item.name}
                  </span>
                </div>
              ))}
              {totalToday > 5 && <div style={{ fontSize: 13, color: '#9E9087', paddingTop: 8 }}>+{totalToday - 5} lainnya...</div>}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9E9087' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
              <p style={{ fontSize: 14 }}>Belum ada exercise hari ini</p>
              <Link to="/checklist" className="btn btn-primary btn-sm" style={{ marginTop: 12, display: 'inline-flex' }}>+ Tambah Exercise</Link>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { to: '/exercises', icon: '💪', label: 'Exercise Library', sub: 'Kelola koleksi exercise kamu', color: '#D92B2B' },
            { to: '/plans', icon: '📋', label: 'Workout Plans', sub: 'Buat & atur rencana latihan', color: '#FF6B35' },
            { to: '/stats', icon: '📊', label: 'Statistik', sub: 'Lihat progress & grafik', color: '#E67E22' },
          ].map(item => (
            <Link key={item.to} to={item.to} className="card" style={{
              padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16,
              textDecoration: 'none', flex: 1
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, fontSize: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${item.color}15`
              }}>{item.icon}</div>
              <div>
                <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 18, textTransform: 'uppercase', color: '#2D2825' }}>{item.label}</div>
                <div style={{ fontSize: 13, color: '#9E9087' }}>{item.sub}</div>
              </div>
              <div style={{ marginLeft: 'auto', color: '#9E9087', fontSize: 18 }}>→</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
