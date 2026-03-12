
import { supabase } from '../lib/supabase';
import { AuthUser } from '../types';

const SESSION_KEY = 'hurema_user_session';

export const authService = {
  async login(accessCode: string, passwordRaw: string): Promise<AuthUser> {
    const { data, error } = await supabase
      .from('accounts')
      .select('id, full_name, internal_nik, access_code, photo_google_id, schedule_type, gender, role')
      .eq('access_code', accessCode)
      .eq('password', passwordRaw)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('Kode Akses atau Password salah.');

    // Determine role based on database value or fallback to access code logic
    const role = data.role || ((data.access_code.startsWith('SP') || data.access_code.includes('ADM')) ? 'admin' : 'user');

    const user: AuthUser = {
      ...data,
      role
    } as AuthUser;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  getCurrentUser(): AuthUser | null {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.reload();
  }
};
