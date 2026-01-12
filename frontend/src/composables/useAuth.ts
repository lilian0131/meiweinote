import { ref, computed } from 'vue';

interface User {
  id: number;
  username: string;
}

const token = ref<string | null>(localStorage.getItem('token'));
const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));

export const useAuth = () => {
  const isAuthenticated = computed(() => !!token.value);

  const setAuth = (newToken: string, newUser: User) => {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const clearAuth = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return {
    token,
    user,
    isAuthenticated,
    setAuth,
    clearAuth
  };
};
