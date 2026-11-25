import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { isAuthenticated, setSession } from '../auth.js';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const from = location.state?.from?.pathname || '/';

  if (isAuthenticated()) {
    return <Navigate to={from} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api.login(username.trim(), password);
      setSession(res);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <form className="login-card card" onSubmit={submit}>
        <h1 className="login-title">TexOrders ERP</h1>
        <p className="login-sub">Sign in to continue</p>
        {error && <div className="login-error" role="alert">{error}</div>}
        <div className="field">
          <label className="label" htmlFor="login-user">Username</label>
          <input
            id="login-user"
            autoFocus
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="field">
          <label className="label" htmlFor="login-pass">Password</label>
          <input
            id="login-pass"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="login-actions">
          <button className="btn blue" type="submit" disabled={busy || !username || !password}>
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
}