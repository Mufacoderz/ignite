import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../utils/api';

const COLORS = ['#D92B2B', '#FF6B35', '#E67E22', '#16A34A', '#2563EB', '#7C3AED', '#9E9087'];

export default function Stats() {
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/stats/summary'),
      api.get('/stats/weekly'),
      api.get('/stats/monthly'),
      api.get('/stats/categories')
    ]).then(([s, w, m, c]) => {
      setSummary(s.data);
      const weekData = w.data.map(d => ({
        date: new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }),
        total: +d.total,
        selesai: +d.completed,
        pct: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0
      }));
      setWeekly(weekData);
      const monthData = m.data.map(d => ({
        month: d.month,
        hari_aktif: +d.active_days,
        selesai: +d.total_completed
      }));
      setMonthly(monthData);
      setCategories(c.data.map(d => ({ name: d.category, value: +d.count })));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 60, color: '#9E9087' }}>Memuat statistik...</div>;

  const StatCard = ({ label, value, sub, emoji }) => (
    <div className="card" style={{ padding: '22px 20px' }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{emoji}</div>
      <div style={{ fontSize: 36, fontFamily: 'Barlow Condensed', fontWeight: 900, background: 'linear-gradient(135deg, #D92B2B, #FF6B35)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#2D2825', marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: 12, color: '#9E9087' }}>{sub}</div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: 'white', border: '1px solid #F2EDE8', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        <p style={{ fontWeight: 700, marginBottom: 6, fontSize: 13, color: '#2D2825' }}>{label}</p>
        {payload.map((p, i) => <p key={i} style={{ fontSize: 13, color: p.color }}>● {p.name}: <strong>{p.value}</strong></p>)}
      </div>
    );
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-header">Statistik & Progress</h1>
        <p className="page-sub">Pantau perjalanan fitness kamu</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          <StatCard emoji="🔥" label="Streak" value={`${summary.streak} hari`} sub="berturut-turut" />
          <StatCard emoji="📅" label="Hari Aktif" value={summary.workout_days} sub="total workout" />
          <StatCard emoji="💪" label="Exercises" value={summary.total_exercises} sub="dibuat" />
          <StatCard emoji="📊" label="Rate Minggu Ini" value={`${summary.completionRate}%`} sub="completion rate" />
        </div>
      )}

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Weekly Bar Chart */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, marginBottom: 4 }}>Aktivitas 4 Minggu Terakhir</h3>
          <p style={{ fontSize: 12, color: '#9E9087', marginBottom: 20 }}>Total vs selesai per hari</p>
          {weekly.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9E9087', fontSize: 14 }}>Belum ada data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE8" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9E9087' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#9E9087' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="Total" fill="#F2EDE8" radius={[4,4,0,0]} />
                <Bar dataKey="selesai" name="Selesai" fill="url(#grad)" radius={[4,4,0,0]} />
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D92B2B" />
                    <stop offset="100%" stopColor="#FF6B35" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Pie */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 18, marginBottom: 4 }}>Distribusi Kategori</h3>
          <p style={{ fontSize: 12, color: '#9E9087', marginBottom: 20 }}>Exercise selesai per kategori</p>
          {categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#9E9087', fontSize: 14 }}>Belum ada data</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categories} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Monthly Line Chart */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 18, marginBottom: 4 }}>Tren Bulanan</h3>
        <p style={{ fontSize: 12, color: '#9E9087', marginBottom: 20 }}>Hari aktif & total exercise selesai per bulan</p>
        {monthly.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9E9087', fontSize: 14 }}>Belum ada data bulanan</div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE8" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9E9087' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9E9087' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="hari_aktif" name="Hari Aktif" stroke="#D92B2B" strokeWidth={2.5} dot={{ fill: '#D92B2B', r: 5 }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="selesai" name="Exercise Selesai" stroke="#FF6B35" strokeWidth={2.5} dot={{ fill: '#FF6B35', r: 5 }} activeDot={{ r: 7 }} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
