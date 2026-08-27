const MEMBER_SESSION_KEY = 'cdp_member_session';

export function loadMemberSession() {
  try {
    const raw = localStorage.getItem(MEMBER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveMemberSession(session) {
  localStorage.setItem(MEMBER_SESSION_KEY, JSON.stringify(session));
}

export function clearMemberSession() {
  localStorage.removeItem(MEMBER_SESSION_KEY);
}
