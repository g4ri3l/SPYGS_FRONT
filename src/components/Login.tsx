import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Declarar el tipo para Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

const Login = () => {
  const navigate = useNavigate();
  const { login, register, googleLogin } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register states
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (registerPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setIsLoading(true);
    try {
      await register(registerName, registerEmail, registerPassword);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cargar el script de Google Identity Services
    const loadGoogleScript = () => {
      // Verificar si ya está cargado
      if (window.google?.accounts) {
        return;
      }

      // Verificar si el script ya existe
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Identity Services cargado');
      };
      script.onerror = () => {
        console.error('Error al cargar Google Identity Services');
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      // Verificar que el Client ID esté configurado
      if (!clientId || 
          clientId === 'TU_CLIENT_ID_AQUI' || 
          clientId === 'TU_CLIENT_ID_DE_GOOGLE_AQUI' ||
          !clientId.includes('.apps.googleusercontent.com')) {
        setError('Google Client ID no configurado. Por favor, configura VITE_GOOGLE_CLIENT_ID en el archivo .env con tu Client ID real de Google');
        setIsLoading(false);
        return;
      }

      // Esperar a que Google Identity Services esté cargado
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!window.google?.accounts && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.google?.accounts) {
        setError('Google Identity Services no está disponible. Por favor, recarga la página.');
        setIsLoading(false);
        return;
      }

      // Inicializar el cliente de token de Google
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
        callback: async (response: { access_token?: string; error?: string; error_description?: string }) => {
          try {
            if (response.error) {
              console.error('Error de Google OAuth:', response.error, response.error_description);
              throw new Error(response.error_description || response.error || 'Error al autenticar con Google');
            }

            if (!response.access_token) {
              throw new Error('No se recibió el token de acceso de Google');
            }

            console.log('Token de Google recibido, enviando al backend...');
            
            // Enviar el token de Google al backend (el backend obtendrá la info del usuario)
            await googleLogin(response.access_token);
            
            console.log('Login con Google exitoso, redirigiendo...');
            
            // Pequeño delay para asegurar que el estado se actualice
            setTimeout(() => {
              navigate('/home');
            }, 100);
          } catch (err: any) {
            console.error('Error en callback de Google:', err);
            setError(err.message || 'Error al iniciar sesión con Google');
            setIsLoading(false);
          }
        },
      });

      // Solicitar el token de acceso
      try {
        client.requestAccessToken();
      } catch (err: any) {
        console.error('Error al solicitar token de Google:', err);
        setError('Error al iniciar el proceso de autenticación con Google. Verifica tu configuración.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google');
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = () => {
    // Aquí irá la lógica de login con Facebook
    console.log('Login con Facebook');
  };

  return (
    <div className="flex justify-center items-center min-h-screen w-full p-8 box-border relative">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden mx-auto">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            className={`flex-1 py-4 px-8 bg-transparent border-none text-base font-medium transition-all duration-300 relative ${
              activeTab === 'login'
                ? 'text-gray-900 font-semibold'
                : 'text-gray-600'
            } hover:text-gray-900 hover:bg-black/5`}
            onClick={() => setActiveTab('login')}
          >
            Iniciar Sesión
            {activeTab === 'login' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-700"></span>
            )}
          </button>
          <button
            className={`flex-1 py-4 px-8 bg-transparent border-none text-base font-medium transition-all duration-300 relative ${
              activeTab === 'register'
                ? 'text-gray-900 font-semibold'
                : 'text-gray-600'
            } hover:text-gray-900 hover:bg-black/5`}
            onClick={() => setActiveTab('register')}
          >
            Registrarse
            {activeTab === 'register' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-500 to-primary-700"></span>
            )}
          </button>
        </div>

        {/* Form Content */}
        <div className="p-10 box-border">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          {activeTab === 'login' ? (
            <>
              <h1 className="text-3xl font-bold text-gray-900 m-0 mb-2 text-center leading-tight">Inicia Sesión</h1>
              <p className="text-sm text-gray-600 text-center mb-8 leading-snug">Accede a tu cuenta para continuar</p>

              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">Email o Usuario</label>
                  <input
                    type="text"
                    id="email"
                    placeholder="Direccion de correo electronico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="py-3.5 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="py-3.5 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 placeholder:text-gray-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="py-3.5 px-6 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 mt-2 w-full hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-500/40 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-900 m-0 mb-2 text-center leading-tight">Crea tu Cuenta</h1>
              <p className="text-sm text-gray-600 text-center mb-8 leading-snug">Regístrate para comenzar</p>

              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="registerName" className="text-sm font-medium text-gray-700">Nombre Completo</label>
                  <input
                    type="text"
                    id="registerName"
                    placeholder="Nombre completo "
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    className="py-3.5 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="registerEmail" className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="registerEmail"
                    placeholder="Direccion de correo electronico"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="py-3.5 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="registerPassword" className="text-sm font-medium text-gray-700">Contraseña</label>
                  <input
                    type="password"
                    id="registerPassword"
                    placeholder="••••••••"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="py-3.5 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 placeholder:text-gray-400"
                    required
                    minLength={6}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="py-3.5 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 bg-gray-50 focus:outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 placeholder:text-gray-400"
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="py-3.5 px-6 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 mt-2 w-full hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary-500/40 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Registrando...' : 'Registrarse'}
                </button>
              </form>
            </>
          )}

          {/* Separator */}
          <div className="flex items-center text-center my-8 text-gray-400 text-xs font-medium uppercase tracking-wider">
            <span className="flex-1 border-b border-gray-200"></span>
            <span className="px-4">O CONTINUAR CON</span>
            <span className="flex-1 border-b border-gray-200"></span>
          </div>

          {/* Social Login Buttons */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-3 py-3.5 px-6 border-2 border-gray-200 rounded-lg bg-white text-base font-medium text-gray-700 cursor-pointer transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 active:translate-y-0 hover:border-blue-500 hover:bg-blue-50/50"
              onClick={handleGoogleLogin}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>

               {/*<button
              type="button"
              className="flex items-center justify-center gap-3 py-3.5 px-6 border-2 border-gray-200 rounded-lg bg-white text-base font-medium text-gray-700 cursor-pointer transition-all duration-300 hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10 active:translate-y-0 hover:border-blue-600 hover:bg-blue-50/50"
              onClick={handleFacebookLogin}
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="#1877F2"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>*/}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

