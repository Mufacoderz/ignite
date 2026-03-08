import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Dumbbell, Target, TrendingUp, Zap } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">DAILY<br/>FIT</div>
        <p className="auth-tagline">Your ultimate fitness companion.<br/>Track, plan, and dominate every workout.</p>
        <div className="auth-features">
          {[
            { icon: Dumbbell, text: 'Build your exercise library' },
            { icon: Target, text: 'Create custom workout plans' },
            { icon: ClipboardCheck, text: 'Daily checklist & progress' },
            { icon: TrendingUp, text: 'Track stats & streaks' },
          ].map(({ icon: Icon, text }, i) => (
            <div key={i} className="auth-feature">
              <div className="auth-feature-icon"><Icon size={18} color="#F97316" /></div>
              {text}
            </div>
          ))}
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-box animate-in">
          <div className="auth-title">WELCOME BACK</div>
          <p className="auth-sub">Log in to continue your journey 💪</p>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
            </div>
            <button className="btn btn-primary btn-lg" style={{width:'100%', justifyContent:'center'}} disabled={loading}>
              <Zap size={16} />
              {loading ? 'Logging in...' : 'LOG IN'}
            </button>
          </form>

          <p style={{textAlign:'center', marginTop:'20px', fontSize:'14px', color:'var(--text-muted)'}}>
            Don't have an account?{' '}
            <Link to="/register" style={{color:'var(--orange)', fontWeight:700, textDecoration:'none'}}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function ClipboardCheck({ size, color }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="4" rx="1" ry="1"/><path d="M9 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2"/><path d="m9 14 2 2 4-4"/></svg>;
}
