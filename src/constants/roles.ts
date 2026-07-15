export type UserRole = 'viewer' | 'admin' | 'master_admin';

export function isAdmin(role: UserRole | undefined | null): boolean {
  return role === 'admin' || role === 'master_admin';
}

export function isMasterAdmin(role: UserRole | undefined | null): boolean {
  return role === 'master_admin';
}
