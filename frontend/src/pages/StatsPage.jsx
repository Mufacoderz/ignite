import { useEffect, useState } from 'react';
import api from '../utils/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Flame, TrendingUp, Dumbbell, Calendar, Target } from 'lucide-react';

const COLORS = ['#DC2626','#EA580C','#F59E0B','#16A34A'];

export default function StatsPage() {
  const [overview, setOverview] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [o, w, c] = await Promise.all([
          api.get('/stats/overview'),
          api.get('/stats/weekly'),
          api.get('/stats/categories')
        ]);
        setOverview(o.data);
        setWeekly(w.data);
        setCategories(c.data);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) return <div className="loader" />;

  const weeklyChartData = weekly.map(d => ({
    day: d.day,
    completed: d.completed,
    total: d.total,
    rate: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0
  }));

  const catData = categories.map(c => ({
    name: c.category,
    value: Number(c.total),
    completed: Number(c.completed)
  }));

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title">STATISTICS</div>
        <p className="page-subtitle">Your fitness journey at a glance</p>
      </div>

      {/* Overview Cards */}
      <div className="stats-grid" style={{marginBottom:'28px'}}>
        <div className="stat-card">
          <div className="stat-icon"><Flame size={48} /></div>
          <div className="stat-value" style={{background:'var(--grad)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
            {overview?.streak ?? 0}
          </div>
          <div className="stat-label">Current Streak</div>
          <div style={{fontSize:'12px', color:'var(--text-light)', marginTop:'4px'}}>consecutive days 🔥</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Dumbbell size={48} /></div>
          <div className="stat-value">{overview?.total_exercises ?? 0}</div>
          <div className="stat-label">Total Exercises</div>
          <div style={{fontSize:'12px', color:'var(--text-light)', marginTop:'4px'}}>in your library</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Calendar size={48} /></div>
          <div className="stat-value">{overview?.total_workout_days ?? 0}</div>
          <div className="stat-label">Workout Days</div>
          <div style={{fontSize:'12px', color:'var(--text-light)', marginTop:'4px'}}>total sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Target size={48} /></div>
          <div className="stat-value">{overview?.completion_rate ?? 0}%</div>
          <div className="stat-label">Completion Rate</div>
          <div style={{fontSize:'12px', color:'var(--text-light)', marginTop:'4px'}}>all time average</div>
        </div>
      </div>

      <div className="grid-2" style={{marginBottom:'20px'}}>
        {/* Weekly Bar Chart */}
        <div className="card">
          <h3 style={{fontFamily:'var(--font-display)', fontSize:'20px', letterSpacing:'1px', marginBottom:'20px'}}>WEEKLY COMPLETIONS</h3>
          {weekly.some(d => d.total > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDEB" vertical={false} />
                <XAxis dataKey="day" tick={{fontSize:12, fontWeight:700, fontFamily:'Barlow'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:11}} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{background:'#FFF', border:'1px solid #E7E5E4', borderRadius:'10px', fontFamily:'Barlow'}}
                  formatter={(val, name) => [val, name === 'completed' ? 'Completed' : 'Total']}
                />
                <Bar dataKey="total" fill="#FED7AA" radius={[6,6,0,0]} name="total" />
                <Bar dataKey="completed" fill="url(#barGrad)" radius={[6,6,0,0]} name="completed" />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#DC2626" />
                    <stop offset="100%" stopColor="#EA580C" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{padding:'40px 0'}}>
              <div className="empty-icon">📊</div>
              <div className="empty-desc">No workout data this week yet. Start checking off exercises!</div>
            </div>
          )}
        </div>

        {/* Completion Rate Line */}
        <div className="card">
          <h3 style={{fontFamily:'var(--font-display)', fontSize:'20px', letterSpacing:'1px', marginBottom:'20px'}}>COMPLETION RATE %</h3>
          {weekly.some(d => d.total > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EDEB" vertical={false} />
                <XAxis dataKey="day" tick={{fontSize:12, fontWeight:700, fontFamily:'Barlow'}} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip
                  contentStyle={{background:'#FFF', border:'1px solid #E7E5E4', borderRadius:'10px', fontFamily:'Barlow'}}
                  formatter={val => [`${val}%`, 'Completion']}
                />
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#DC2626" />
                    <stop offset="100%" stopColor="#EA580C" />
                  </linearGradient>
                </defs>
                <Line type="monotone" dataKey="rate" stroke="url(#lineGrad)" strokeWidth={3}
                  dot={{fill:'var(--orange)', strokeWidth:2, r:5}} activeDot={{r:7}} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{padding:'40px 0'}}>
              <div className="empty-icon">📈</div>
              <div className="empty-desc">Complete workouts to see your progress line.</div>
            </div>
          )}
        </div>
      </div>

      {/* Category Breakdown */}
      {catData.length > 0 && (
        <div className="card">
          <h3 style={{fontFamily:'var(--font-display)', fontSize:'20px', letterSpacing:'1px', marginBottom:'20px'}}>BY CATEGORY</h3>
          <div style={{display:'flex', gap:'24px', flexWrap:'wrap', alignItems:'center'}}>
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={catData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={40}>
                  {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{borderRadius:'10px', fontFamily:'Barlow'}} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{flex:1, display:'flex', flexDirection:'column', gap:'12px'}}>
              {catData.map((cat, i) => (
                <div key={i}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'4px'}}>
                    <span style={{fontSize:'13px', fontWeight:'700', textTransform:'capitalize'}}>{cat.name}</span>
                    <span style={{fontSize:'13px', color:'var(--text-muted)'}}>{cat.completed}/{cat.value} done</span>
                  </div>
                  <div className="progress-bar-wrap" style={{height:'8px'}}>
                    <div className="progress-bar-fill" style={{width:`${cat.value > 0 ? (cat.completed/cat.value)*100 : 0}%`, background:COLORS[i%COLORS.length]}} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
