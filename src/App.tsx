import React, { createContext, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { TranslationPanel } from './components/TranslationPanel';
import { LandingPage } from './components/LandingPage';
import { Background3D } from './components/Background3D';
import { lightTheme, darkTheme } from './styles/theme';

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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Router>
      <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, showTranslator, setShowTranslator }}>
          <div className={`min-h-screen transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
              : 'bg-gradient-to-br from-primary-light to-success-light'
          }`}>
            {showTranslator ? (
              <>
                <Background3D />
                <TranslationPanel />
              </>
            ) : (
              <LandingPage />
            )}
          </div>
        </ThemeContext.Provider>
      </ThemeProvider>
    </Router>
  );
}

export default App;