import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { FileText, Volume2, Sun, Moon, Download, Share2, Printer, Plus, Minus, ArrowLeft, Globe2 } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { ThemeContext } from '../App';
import { AITranslationService } from '../lib/aiTranslation';
import { useNavigate } from 'react-router-dom';

interface TranslationPanelProps {}

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'bn', name: 'Bengali' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'or', name: 'Odia' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ur', name: 'Urdu' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
];

export const TranslationPanel: React.FC<TranslationPanelProps> = () => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [fontSize, setFontSize] = useState(16);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('en');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [error, setError] = useState<string | null>(null);

  const handleFontSizeChange = (size: number) => {
    setFontSize(Math.min(Math.max(size, 16), 24));
  };

  const handleTranslateClick = async () => {
    if (!inputText.trim()) {
      setError('Please enter text to translate');
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const translationService = AITranslationService.getInstance();
      const result = await translationService.translate({
        text: inputText,
        sourceLanguage,
        targetLanguage
      });

      setTranslatedText(result.translatedText);
      setError(null);
    } catch (err) {
      console.error('Translation error:', err);
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      console.log('Processing image:', file.name);
    } else if (file.type === 'application/pdf') {
      console.log('Processing PDF:', file.name);
    }
  };

  const handleExport = () => {
    if (!translatedText) return;
    const element = document.createElement('a');
    const file = new Blob([translatedText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'medical-translation.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = async () => {
    if (!translatedText) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Medical Translation',
          text: translatedText,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(translatedText);
      alert('Content copied to clipboard!');
    }
  };

  const handlePrint = () => {
    if (!translatedText) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Medical Translation</title>
            <style>
              body { font-family: 'Poppins', sans-serif; padding: 20px; }
              .content { max-width: 800px; margin: 0 auto; }
            </style>
          </head>
          <body>
            <div class="content">
              <h1>Medical Translation</h1>
              <div>${translatedText}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-6"
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className={`p-3 rounded-full transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-white text-gray-800 shadow-lg hover:shadow-xl'
            }`}
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </motion.button>
          <motion.h1 
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            className={`text-4xl font-bold ${
              isDarkMode 
                ? 'text-white' 
                : 'bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-500'
            }`}
          >
            Medical Text Translator
          </motion.h1>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 rounded-full p-2 ${
            isDarkMode ? 'bg-gray-700' : 'bg-white shadow-lg'
          }`}>
            <Globe2 size={20} className={isDarkMode ? 'text-white' : 'text-gray-600'} />
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className={`px-3 py-1 rounded-full outline-none ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-800 border-gray-200'
              }`}
              disabled={isTranslating}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <span className={isDarkMode ? 'text-white' : 'text-gray-600'}>→</span>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className={`px-3 py-1 rounded-full outline-none ${
                isDarkMode 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-white text-gray-800 border-gray-200'
              }`}
              disabled={isTranslating}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
          <div className={`flex items-center gap-2 rounded-full p-2 ${
            isDarkMode ? 'bg-gray-700' : 'bg-white shadow-lg'
          }`}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleFontSizeChange(fontSize - 2)}
              className={`p-2 rounded-full ${
                isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
              }`}
              aria-label="Decrease font size"
            >
              <Minus size={20} />
            </motion.button>
            <span className={isDarkMode ? 'text-white' : 'text-gray-600'} style={{ width: '4rem', textAlign: 'center' }}>
              {fontSize}px
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleFontSizeChange(fontSize + 2)}
              className={`p-2 rounded-full ${
                isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
              }`}
              aria-label="Increase font size"
            >
              <Plus size={20} />
            </motion.button>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className={`p-3 rounded-full transition-all duration-300 ${
              isDarkMode 
                ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                : 'bg-white text-gray-800 shadow-lg hover:shadow-xl'
            }`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="space-y-4"
        >
          <div className={`rounded-2xl shadow-xl backdrop-blur-lg p-6 ${
            isDarkMode ? 'bg-gray-800 bg-opacity-90' : 'bg-white bg-opacity-90'
          }`}>
            <div className={`flex items-center gap-2 rounded-full p-2 mb-4 ${
              isDarkMode ? 'bg-gray-700' : 'bg-white shadow-lg'
            }`}>
              <Globe2 size={20} className={isDarkMode ? 'text-white' : 'text-gray-600'} />
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value)}
                className={`px-3 py-1 rounded-full outline-none ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-800 border-gray-200'
                }`}
                disabled={isTranslating}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <span className={isDarkMode ? 'text-white' : 'text-gray-600'}>→</span>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className={`px-3 py-1 rounded-full outline-none ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-800 border-gray-200'
                }`}
                disabled={isTranslating}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <FileUpload onFileSelect={handleFileSelect} />
            <div className="mt-4">
              <textarea
                className={`input-field ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white border-gray-600 focus:ring-blue-500' 
                    : 'bg-white text-gray-800 border-gray-200'
                }`}
                style={{ fontSize: `${fontSize}px` }}
                placeholder="Paste your medical text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTranslating}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`btn-primary flex items-center gap-2 ${isTranslating ? 'opacity-70 cursor-not-allowed' : ''}`}
              onClick={handleTranslateClick}
              disabled={isTranslating || !inputText.trim()}
            >
              <FileText size={20} />
              {isTranslating ? 'Translating...' : 'Translate'}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary flex items-center gap-2"
              disabled={isTranslating}
            >
              <Volume2 size={20} />
              Read Aloud
            </motion.button>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-800'
              }`}
            >
              {error}
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className={`rounded-2xl shadow-xl backdrop-blur-lg p-6 ${
            isDarkMode ? 'bg-gray-800 bg-opacity-90' : 'bg-white bg-opacity-90'
          }`}
        >
          <h2 className={`text-2xl font-semibold mb-4 ${
            isDarkMode 
              ? 'text-white' 
              : 'bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-500'
          }`}>
            Translation
          </h2>
          <div 
            className="prose"
            style={{ fontSize: `${fontSize}px` }}
          >
            {translatedText ? (
              <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {translatedText}
              </p>
            ) : (
              <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Your translated text will appear here...
              </p>
            )}
          </div>
          <motion.div 
            className="flex gap-4 mt-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`btn-primary flex items-center gap-2 ${!translatedText ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleExport}
              disabled={!translatedText}
            >
              <Download size={20} />
              Export
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`btn-primary flex items-center gap-2 ${!translatedText ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleShare}
              disabled={!translatedText}
            >
              <Share2 size={20} />
              Share
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`btn-primary flex items-center gap-2 ${!translatedText ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handlePrint}
              disabled={!translatedText}
            >
              <Printer size={20} />
              Print
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};