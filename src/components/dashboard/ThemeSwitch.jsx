import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * ThemeSwitch - Toggle between light and dark mode
 */
const ThemeSwitch = ({ className = '' }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check for saved preference, default to dark
    const savedTheme = localStorage.getItem('theme');

    // Default to dark mode if no preference saved
    const shouldBeDark = savedTheme !== 'light';
    setIsDark(shouldBeDark);

    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');

    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative flex items-center justify-center
        w-10 h-10 rounded-xl
        bg-gray-100 dark:bg-gray-800
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-all duration-200 ease-in-out
        ${className}
      `}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <Sun
        className={`
          w-5 h-5 text-amber-500
          absolute transition-all duration-200 ease-in-out
          ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}
        `}
      />
      <Moon
        className={`
          w-5 h-5 text-gray-400
          absolute transition-all duration-200 ease-in-out
          ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}
        `}
      />
    </button>
  );
};

export default ThemeSwitch;
