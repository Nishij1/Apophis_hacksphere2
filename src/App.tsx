import { createContext, useState } from 'react';
import { LandingPage } from './components/LandingPage';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  showTranslator: boolean;
  setShowTranslator: (show: boolean) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  showTranslator: false,
  setShowTranslator: () => {},
});

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showTranslator, setShowTranslator] = useState(false);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const bgClasses = isDarkMode 
    ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
    : 'bg-gradient-to-br from-primary-light to-success-light';

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, showTranslator, setShowTranslator }}>
      <div className={`min-h-screen transition-colors duration-300 ${bgClasses}`}>
        <LandingPage />
      </div>
    </ThemeContext.Provider>
  );
}

export default App;