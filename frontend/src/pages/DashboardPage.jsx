import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Flame, Dumbbell, Calendar, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [weekly, setWeekly] = useState([]);
  const [todayChecklist, setTodayChecklist] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const load = async () => {
      try {
        const [s, w, c] = await Promise.all([
          api.get('/stats/overview'),
          api.get('/stats/weekly'),
          api.get(`/checklist?date=${today}`)
        ]);
        setStats(s.data);
        setWeekly(w.data);
        setTodayChecklist(c.data);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const todayCompleted = todayChecklist.filter(i => i.is_completed).length;
  const todayTotal = todayChecklist.length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) return <div className="loader" />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-title">{greeting.toUpperCase()},</div>
        <div className="page-title" style={{WebkitTextFillColor:'var(--text)', background:'none'}}>{user?.name?.toUpperCase()}</div>
        <p className="page-subtitle">Here's your fitness overview for today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><Flame size={48} /></div>
          <div className="stat-value">{stats?.streak ?? 0}</div>
          <div className="stat-label">Day Streak 🔥</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Dumbbell size={48} /></div>
          <div className="stat-value">{stats?.total_exercises ?? 0}</div>
          <div className="stat-label">Exercises</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Calendar size={48} /></div>
          <div className="stat-value">{stats?.total_workout_days ?? 0}</div>
          <div className="stat-label">Workout Days</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><TrendingUp size={48} /></div>
          <div className="stat-value">{stats?.completion_rate ?? 0}%</div>
          <div className="stat-label">Completion Rate</div>
        </div>
      </div>

      <div className="grid-2">
        {/* Today's Checklist */}
        <div className="card">
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px'}}>
            <h2 style={{fontFamily:'var(--font-display)', fontSize:'22px', letterSpacing:'1px'}}>TODAY'S WORKOUT</h2>
            <Link to="/checklist" className="btn btn-sm btn-secondary">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {todayTotal > 0 ? (
            <>
              <div style={{marginBottom:'14px'}}>
                <div style={{display:'flex', justifyContent:'space-between', fontSize:'13px', fontWeight:'700', marginBottom:'6px'}}>
                  <span style={{color:'var(--text-muted)'}}>PROGRESS</span>
                  <span style={{color:'var(--orange)'}}>{todayCompleted}/{todayTotal}</span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{width: todayTotal ? `${(todayCompleted/todayTotal)*100}%` : '0%'}} />
                </div>
              </div>
              {todayChecklist.slice(0,4).map(item => (
                <div key={item.id} className={`checklist-item ${item.is_completed ? 'completed' : ''}`}>
                  <div className={`check-btn ${item.is_completed ? 'checked' : ''}`}>
                    {item.is_completed && <CheckCircle2 size={14} color="white" />}
                  </div>
                  <div className="checklist-info">
                    <div className="checklist-name">{item.exercise_name}</div>
                    <div className="checklist-sub">{item.sets} sets × {item.reps} reps</div>
                  </div>
                </div>
              ))}
              {todayTotal > 4 && <p style={{fontSize:'13px', color:'var(--text-muted)', textAlign:'center', marginTop:'8px'}}>+{todayTotal - 4} more exercises</p>}
            </>
          ) : (
            <div className="empty-state" style={{padding:'30px 0'}}>
              <div className="empty-icon">📋</div>
              <div className="empty-title">NO EXERCISES TODAY</div>
              <div className="empty-desc">Head to Daily Checklist to add exercises for today.</div>
              <Link to="/checklist" className="btn btn-primary btn-sm">Go to Checklist</Link>
            </div>
          )}
        </div>

        {/* Weekly Bar */}
        <div className="card">
          <h2 style={{fontFamily:'var(--font-display)', fontSize:'22px', letterSpacing:'1px', marginBottom:'20px'}}>WEEKLY PROGRESS</h2>
          <div style={{display:'flex', gap:'10px', alignItems:'flex-end', height:'120px'}}>
            {weekly.map((d, i) => {
              const pct = d.total > 0 ? (d.completed / d.total) : 0;
              const isToday = d.date === today;
              return (
                <div key={i} style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'6px'}}>
                  <div style={{
                    width:'100%', 
                    height: `${Math.max(pct * 90, d.total > 0 ? 8 : 0)}px`,
                    background: isToday ? 'var(--grad)' : d.total > 0 ? 'var(--border-warm)' : 'var(--border)',
                    borderRadius:'6px',
                    transition:'height 0.5s ease',
                    position:'relative',
                    minHeight: d.total > 0 ? '8px' : '2px'
                  }} />
                  <span style={{fontSize:'11px', fontWeight:'700', color: isToday ? 'var(--orange)' : 'var(--text-light)', letterSpacing:'0.5px'}}>{d.day}</span>
                </div>
              );
            })}
          </div>
          <Link to="/stats" className="btn btn-ghost btn-sm" style={{marginTop:'16px', width:'100%', justifyContent:'center'}}>
            Full Statistics <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{marginTop:'20px'}}>
        <h2 style={{fontFamily:'var(--font-display)', fontSize:'22px', letterSpacing:'1px', marginBottom:'14px'}}>QUICK ACTIONS</h2>
        <div style={{display:'flex', gap:'12px', flexWrap:'wrap'}}>
          <Link to="/exercises" className="btn btn-primary"><Dumbbell size={16}/> Add Exercise</Link>
          <Link to="/plans" className="btn btn-secondary">📋 Create Plan</Link>
          <Link to="/checklist" className="btn btn-secondary">✅ Start Workout</Link>
          <Link to="/stats" className="btn btn-ghost"><TrendingUp size={16}/> View Stats</Link>
        </div>
      </div>
    </div>
  );
}
