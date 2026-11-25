import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { isAuthenticated, setSession } from '../auth.js';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const from = location.state?.from?.pathname || '/';

  if (isAuthenticated()) {
    return <Navigate to={from} replace />;
  }

  const submitLogin = async (e) => {
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

  const submitForgot = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    try {
      const res = await api.forgotPassword(username.trim());
      setResetToken(res.token || '');
      setInfo('Reset token generated. Enter it below with your new password.');
    } catch (err) {
      setError(err.message || 'Could not start password reset');
    } finally {
      setBusy(false);
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setBusy(true);
    try {
      await api.resetPassword(resetToken.trim(), newPassword);
      setInfo('Password reset successful. You can now sign in.');
      setMode('login');
      setPassword('');
      setNewPassword('');
      setResetToken('');
    } catch (err) {
      setError(err.message || 'Password reset failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-shell">
        <aside className="login-brand">
          <div className="brand-mark">TO</div>
          <h2 className="brand-title">TexOrders ERP</h2>
          <p className="brand-tagline">Yarn &amp; Textile Sales Order Management</p>
          <ul className="brand-points">
            <li>Domestic &amp; Purchase Orders</li>
            <li>Dispatch, Tracking &amp; Reports</li>
            <li>Secure, role-based access</li>
          </ul>
          <div className="brand-foot">Pro v3 · 2.0 LIVE</div>
        </aside>

        <section className="login-panel">
          {mode === 'login' ? (
            <form className="login-form" onSubmit={submitLogin}>
              <h1 className="login-title">Welcome back</h1>
              <p className="login-sub">Sign in to your workspace</p>
              {error && <div className="login-alert error" role="alert">{error}</div>}
              {info && <div className="login-alert info" role="status">{info}</div>}
              <div className="login-field">
                <label htmlFor="login-user">Username</label>
                <input id="login-user" autoFocus autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="login-field">
                <label htmlFor="login-pass">Password</label>
                <input id="login-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button className="btn blue login-btn" type="submit" disabled={busy || !username || !password}>
                {busy ? 'Signing in…' : 'Sign In'}
              </button>
              <div className="login-links">
                <button type="button" className="login-link" onClick={() => { setMode('forgot'); setError(''); setInfo(''); }}>
                  Forgot password?
                </button>
              </div>
            </form>
          ) : (
            <form className="login-form" onSubmit={resetToken ? submitReset : submitForgot}>
              <h1 className="login-title">Reset Password</h1>
              <p className="login-sub">{resetToken ? 'Set a new password' : 'Enter your username to get a reset token'}</p>
              {error && <div className="login-alert error" role="alert">{error}</div>}
              {info && <div className="login-alert info" role="status">{info}</div>}
              {!resetToken && (
                <div className="login-field">
                  <label htmlFor="fp-user">Username</label>
                  <input id="fp-user" autoFocus autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
              )}
              {resetToken && (
                <>
                  <div className="login-field">
                    <label htmlFor="fp-token">Token</label>
                    <input id="fp-token" value={resetToken} readOnly />
                  </div>
                  <div className="login-field">
                    <label htmlFor="fp-new">New Password</label>
                    <input id="fp-new" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                </>
              )}
              {!resetToken && (
                <button className="btn gold login-btn" type="submit" disabled={busy || !username}>
                  {busy ? 'Sending…' : 'Get Reset Token'}
                </button>
              )}
              {resetToken && (
                <button className="btn green login-btn" type="submit" disabled={busy || !newPassword}>
                  {busy ? 'Resetting…' : 'Reset Password'}
                </button>
              )}
              <div className="login-links">
                <button type="button" className="login-link" onClick={() => { setMode('login'); setError(''); setInfo(''); setResetToken(''); }}>
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}