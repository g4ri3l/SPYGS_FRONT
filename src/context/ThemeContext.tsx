import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    // Si hay un valor guardado que no sea válido, o si es 'auto', usar 'light'
    if (saved === 'light' || saved === 'dark') {
      return saved as Theme;
    }
    // Por defecto, siempre empezar en 'light' (blanco)
    return 'light';
  });

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  // Aplicar tema al cargar la página (solo una vez)
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    // Aplicar tema inicial
    const initialTheme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
    const shouldBeDark = initialTheme === 'dark';

    setIsDark(shouldBeDark);

    // Aplicar o remover la clase dark
    if (shouldBeDark) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    
    // Forzar actualización del fondo inmediatamente
    root.style.setProperty('background', shouldBeDark 
      ? 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)'
      : '#ffffff', 'important');
    body.style.setProperty('background', shouldBeDark 
      ? 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)'
      : '#ffffff', 'important');
  }, []);

  // Aplicar tema cuando cambia
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    
    const shouldBeDark = theme === 'dark';

    setIsDark(shouldBeDark);

    // Aplicar o remover la clase dark de forma forzada
    if (shouldBeDark) {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
    
    // Forzar actualización del fondo con !important
    const lightBg = '#ffffff';
    const darkBg = 'linear-gradient(135deg, #1f2937 0%, #111827 50%, #0f172a 100%)';
    
    root.style.background = shouldBeDark ? darkBg : lightBg;
    root.style.setProperty('background', shouldBeDark ? darkBg : lightBg, 'important');
    
    body.style.background = shouldBeDark ? darkBg : lightBg;
    body.style.setProperty('background', shouldBeDark ? darkBg : lightBg, 'important');
    
    // Guardar en localStorage
    localStorage.setItem('theme', theme);
    
    // Forzar re-render
    setTimeout(() => {
      root.style.background = shouldBeDark ? darkBg : lightBg;
      body.style.background = shouldBeDark ? darkBg : lightBg;
    }, 0);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

