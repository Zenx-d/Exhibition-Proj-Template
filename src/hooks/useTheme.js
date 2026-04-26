import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState('system'); // system, light, dark

  useEffect(() => {
    // Initialization
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      setTheme('system');
      applyTheme('system');
    }
  }, []);

  const applyTheme = (newTheme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
  };

  const toggleTheme = () => {
    let nextTheme;
    if (theme === 'light') nextTheme = 'dark';
    else if (theme === 'dark') nextTheme = 'system';
    else nextTheme = 'light'; // system -> light

    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  };

  return { theme, toggleTheme };
}
