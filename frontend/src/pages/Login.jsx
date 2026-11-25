import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { isAuthenticated, setSession } from '../auth.js';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState(location.state?.forgot ? 'forgot' : 'login');
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
      <div className="login-card">
        <div className="login-head">
          <span className="login-brand">TexOrders</span>
        </div>
        <div className="login-body">
          {mode === 'login' ? (
            <form onSubmit={submitLogin}>
              <h2 className="login-title">Sign In</h2>
              {error && <div className="login-alert error" role="alert">{error}</div>}
              {info && <div className="login-alert info" role="status">{info}</div>}
              <div className="field">
                <label className="label" htmlFor="login-user">Username</label>
                <input id="login-user" autoFocus autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div className="field">
                <label className="label" htmlFor="login-pass">Password</label>
                <input id="login-pass" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="login-actions">
                <button className="btn blue" type="submit" disabled={busy || !username || !password}>
                  {busy ? 'Signing in…' : 'Sign In'}
                </button>
              </div>
              <div className="login-links">
                <button type="button" className="login-link" onClick={() => { setMode('forgot'); setError(''); setInfo(''); }}>
                  <svg className="login-link-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="7.5" cy="15.5" r="4.5" />
                    <path d="m10.7 12.3 8.8-8.8" />
                    <path d="m17 6 2 2" />
                    <path d="m14 9 2 2" />
                  </svg>
                  Forgot password?
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={resetToken ? submitReset : submitForgot}>
              <h2 className="login-title">Reset Password</h2>
              {error && <div className="login-alert error" role="alert">{error}</div>}
              {info && <div className="login-alert info" role="status">{info}</div>}
              {!resetToken && (
                <div className="field">
                  <label className="label" htmlFor="fp-user">Username</label>
                  <input id="fp-user" autoFocus autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                </div>
              )}
              {resetToken && (
                <>
                  <div className="field">
                    <label className="label" htmlFor="fp-token">Token</label>
                    <input id="fp-token" value={resetToken} readOnly />
                  </div>
                  <div className="field">
                    <label className="label" htmlFor="fp-new">New Password</label>
                    <input id="fp-new" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                </>
              )}
              <div className="login-actions">
                {!resetToken && (
                  <button className="btn gold" type="submit" disabled={busy || !username}>
                    {busy ? 'Sending…' : 'Get Reset Token'}
                  </button>
                )}
                {resetToken && (
                  <button className="btn green" type="submit" disabled={busy || !newPassword}>
                    {busy ? 'Resetting…' : 'Reset Password'}
                  </button>
                )}
              </div>
              <div className="login-links">
                <button type="button" className="login-link" onClick={() => { setMode('login'); setError(''); setInfo(''); setResetToken(''); }}>
                  Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}