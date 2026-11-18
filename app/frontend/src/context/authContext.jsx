import axios from 'axios';
import { useEffect, useState } from 'react';
import { UserContext } from './useAuth';
export default function AuthContext({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    localStorage.removeItem('token');
    const controller = new AbortController();
    axios.get('/api/auth/verify', { signal: controller.signal })
      .then(({ data }) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);
  const logout = async () => {
    try { await axios.post('/api/auth/logout'); setUser(null); }
    catch { window.alert('Sign out failed. Please try again.'); }
  };
  return <UserContext.Provider value={{ user, login: setUser, logout, loading }}>{children}</UserContext.Provider>;
}
