import type { Session } from './types';
// Browser-local demonstration accounts. Not production authentication or access control.
type LocalAccount = { name: string; email: string; passwordHash: string; role?: string };
const key = 'orbital-demo-accounts';
function accounts(): LocalAccount[] {
 const saved = JSON.parse(localStorage.getItem(key) ?? '[]');
 if (!Array.isArray(saved)) throw new Error('Local account storage could not be read. You can still enter the demo workspace.');
 return saved.filter(a => typeof a.email === 'string' && typeof a.passwordHash === 'string');
}
async function hash(password: string) {
 const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
 return Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2, '0')).join('');
}
export async function registerLocalAccount(name: string, email: string, password: string): Promise<Session> {
 const normalized = email.trim().toLowerCase();
 if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) || password.length < 8) throw new Error('Enter your name, a valid email, and a password of at least 8 characters.');
 const existing = accounts();
 if (existing.some(a => a.email === normalized)) throw new Error('An account with this email already exists in this browser. Sign in to add another organization.');
 const account = { name: name.trim(), email: normalized, passwordHash: await hash(password), role: 'Geospatial analyst' };
 localStorage.setItem(key, JSON.stringify([...existing, account]));
 return { name: account.name, email: account.email, role: account.role };
}
export async function signInLocalAccount(email: string, password: string): Promise<Session> {
 const passwordHash = await hash(password);
 const account = accounts().find(a => a.email === email.trim().toLowerCase() && a.passwordHash === passwordHash);
 if (!account) throw new Error('Email or password doesn’t match a local account. Try again, create an account, or enter the demo workspace.');
 return { name: account.name, email: account.email, role: account.role ?? 'Geospatial analyst' };
}
export function updateLocalProfile(previousEmail: string, next: Session) {
 const existing = accounts();
 const current = existing.find(a => a.email === previousEmail);
 if (existing.some(a => a.email === next.email && a.email !== previousEmail)) throw new Error('That email already belongs to another local account.');
 if (current) localStorage.setItem(key, JSON.stringify(existing.map(a => a.email === previousEmail ? { ...a, ...next } : a)));
}
