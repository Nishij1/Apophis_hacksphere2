import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, PauseCircle, Square, Volume2, Languages, Settings } from 'lucide-react';
import { ThemeContext } from '../App';
import TextToSpeech, { TTSOptions } from '../lib/textToSpeech';

interface TTSControlsProps {
  text: string;
  language: TTSOptions['language'];
  onLanguageChange?: (language: TTSOptions['language']) => void;
}

const TTSControls: React.FC<TTSControlsProps> = ({
  text,
  language,
  onLanguageChange
}) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);

  const tts = TextToSpeech.getInstance();

  const handlePlay = () => {
    if (isPaused) {
      tts.resume();
    } else {
      tts.speak(text, { language, rate, pitch, volume });
    }
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    tts.pause();
    setIsPaused(true);
  };

  const handleStop = () => {
    tts.stop();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === 'en-US' ? 'hi-IN' : 'en-US';
    onLanguageChange?.(newLanguage);
  };

  return (
    <div className={`rounded-lg p-4 ${
      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isPlaying && !isPaused ? (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePause}
              className="p-2 rounded-full bg-blue-500 text-white"
            >
              <PauseCircle size={20} />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handlePlay}
              className="p-2 rounded-full bg-blue-500 text-white"
            >
              <PlayCircle size={20} />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleStop}
            className={`p-2 rounded-full ${
              isDarkMode 
                ? 'bg-gray-600 text-gray-300' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <Square size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLanguageToggle}
            className={`p-2 rounded-full ${
              isDarkMode 
                ? 'bg-gray-600 text-gray-300' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <Languages size={20} />
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-full ${
            isDarkMode 
              ? 'bg-gray-600 text-gray-300' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          <Settings size={20} />
        </motion.button>
      </div>

      {showSettings && (
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Speed
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Pitch
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Volume
            </label>
            <div className="flex items-center gap-2">
              <Volume2 size={16} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TTSControls;