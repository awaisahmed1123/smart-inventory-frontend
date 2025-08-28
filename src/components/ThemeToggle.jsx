import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';

function ThemeToggle() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') ? localStorage.getItem('theme') : 'light');

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.querySelector('html').setAttribute('data-theme', theme);
  }, [theme]);

  const handleToggle = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      className="btn btn-ghost btn-circle"
      onClick={handleToggle}
      aria-label="Toggle theme"
    >
      {/* AnimatePresence ka istemal taake icon change hotay waqt animation ho */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ y: -20, opacity: 0, rotate: -90 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 20, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {theme === 'light' ? (
            <FiSun className="h-6 w-6" />
          ) : (
            <FiMoon className="h-6 w-6" />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}

export default ThemeToggle;