const TOKEN_KEY = 'so_token';
const USER_KEY = 'so_user';
const ROLE_KEY = 'so_role';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  return localStorage.getItem(USER_KEY);
}

export function getRole() {
  return localStorage.getItem(ROLE_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}

export function setSession({ token, username, role } = {}) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (username != null) localStorage.setItem(USER_KEY, username || '');
  if (role != null) localStorage.setItem(ROLE_KEY, role || '');
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function logout() {
  clearSession();
  window.location.assign('/login');
}