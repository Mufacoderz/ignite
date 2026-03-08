import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Dumbbell, TrendingUp, Zap } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">START<br/>STRONG</div>
        <p className="auth-tagline">Join DailyFit and transform your workout routine into a powerful habit.</p>
        <div className="auth-features">
          {[
            { icon: Dumbbell, text: 'Unlimited exercise library' },
            { icon: TrendingUp, text: 'Weekly progress graphs' },
            { icon: Zap, text: 'Streak tracking system' },
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
          <div className="auth-title">CREATE ACCOUNT</div>
          <p className="auth-sub">Start your fitness journey today 🔥</p>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" placeholder="Your name"
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min. 6 characters"
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} required minLength={6} />
            </div>
            <button className="btn btn-primary btn-lg" style={{width:'100%', justifyContent:'center'}} disabled={loading}>
              <Zap size={16} />
              {loading ? 'Creating account...' : 'GET STARTED'}
            </button>
          </form>

          <p style={{textAlign:'center', marginTop:'20px', fontSize:'14px', color:'var(--text-muted)'}}>
            Already have an account?{' '}
            <Link to="/login" style={{color:'var(--orange)', fontWeight:700, textDecoration:'none'}}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
