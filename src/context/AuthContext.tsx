import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (googleToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay un token guardado al cargar la app
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      // Verificar si el token es válido
      authAPI.verify()
        .then((data) => {
          if (data.valid && data.user) {
            // Si el token es válido y tenemos datos del usuario, establecerlos
            setUser({
              id: data.user.userId || data.user.id || '',
              name: data.user.name || '',
              email: data.user.email || ''
            });
          } else if (!data.valid) {
            // Token inválido, limpiar
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
          }
        })
        .catch((error) => {
          console.error('Error al verificar token:', error);
          // Error al verificar, limpiar
          setToken(null);
          setUser(null);
          localStorage.removeItem('token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await authAPI.login(email, password);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const data = await authAPI.register(name, email, password);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
    } catch (error) {
      throw error;
    }
  };

  const googleLogin = async (googleToken: string) => {
    try {
      const data = await authAPI.googleLogin(googleToken);
      if (!data.token || !data.user) {
        throw new Error('Respuesta inválida del servidor');
      }
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      setIsLoading(false); // Asegurar que isLoading sea false después del login
    } catch (error: any) {
      console.error('Error en googleLogin:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        googleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};



