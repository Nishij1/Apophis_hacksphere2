import React, { useContext, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../App';
import { diffWords, Change } from 'diff';
import type { Report } from './Searchbar';
import TTSControls from './TTSControls';
import type { TTSOptions } from '../lib/textToSpeech';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface ReportComparisonProps {
  reports: [Report, Report];
  onBack: () => void;
}

const ReportComparison: React.FC<ReportComparisonProps> = ({ reports, onBack }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [language, setLanguage] = useState<TTSOptions['language']>('en-US');
  const [activeTab, setActiveTab] = useState<'original' | 'simplified'>('simplified');

  const differences = useMemo(() => {
    const [report1, report2] = reports;
    return {
      original: diffWords(report1.content, report2.content),
      simplified: diffWords(
        report1.simplifiedContent || report1.content,
        report2.simplifiedContent || report2.content
      )
    };
  }, [reports]);

  // Get the differences as a readable text for TTS
  const differenceText = useMemo(() => {
    const diffs = activeTab === 'simplified' ? differences.simplified : differences.original;
    return diffs.map((part: Change) => {
      if (part.added) {
        return `Added: ${part.value}. `;
      } else if (part.removed) {
        return `Removed: ${part.value}. `;
      }
      return part.value + ' ';
    }).join('');
  }, [differences, activeTab]);

  // Combine and deduplicate medical terms from both reports
  const allMedicalTerms = useMemo(() => {
    const termMap = new Map<string, {
      term: string;
      explanation: string;
      inReport1: boolean;
      inReport2: boolean;
    }>();

    reports[0].medicalTerms?.forEach(term => {
      termMap.set(term.term.toLowerCase(), {
        ...term,
        inReport1: true,
        inReport2: false
      });
    });

    reports[1].medicalTerms?.forEach(term => {
      const key = term.term.toLowerCase();
      if (termMap.has(key)) {
        const existing = termMap.get(key)!;
        termMap.set(key, {
          ...existing,
          inReport2: true
        });
      } else {
        termMap.set(key, {
          ...term,
          inReport1: false,
          inReport2: true
        });
      }
    });

    return Array.from(termMap.values());
  }, [reports]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-blue-50'}`}>
      <div className="max-w-6xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl p-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-xl`}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className={`p-3 rounded-full transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-gray-700 text-white hover:bg-gray-600' 
                    : 'bg-white text-gray-800 shadow-lg hover:shadow-xl'
                }`}
                aria-label="Go back"
              >
                <ArrowLeft size={24} />
              </motion.button>
              <h1 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Report Comparison
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {reports.map((report, index) => (
              <div
                key={report.id}
                className={`p-4 rounded-lg ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <h2 className={`font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Report {index + 1}
                </h2>
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Source: {report.source}
                  <br />
                  Date: {report.timestamp.toLocaleDateString()}
                </div>
                {report.summary && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Summary:</span> {report.summary}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveTab('simplified')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'simplified'
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Simplified View
                </button>
                <button
                  onClick={() => setActiveTab('original')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'original'
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Original Text
                </button>
              </div>
              <TTSControls 
                text={differenceText}
                language={language}
                onLanguageChange={setLanguage}
              />
            </div>

            <div className={`rounded-lg p-4 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <h2 className={`font-semibold mb-4 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Text Differences
              </h2>
              <div className={`prose ${
                isDarkMode ? 'prose-invert' : ''
              } max-w-none`}>
                {(activeTab === 'simplified' ? differences.simplified : differences.original)
                  .map((part: Change, index) => (
                    <span
                      key={index}
                      className={
                        part.added
                          ? 'bg-green-200 dark:bg-green-900'
                          : part.removed
                          ? 'bg-red-200 dark:bg-red-900'
                          : ''
                      }
                    >
                      {part.value}
                    </span>
                  ))}
              </div>
            </div>

            {allMedicalTerms.length > 0 && (
              <div className={`rounded-lg p-4 ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <h2 className={`font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Medical Terms
                </h2>
                <div className="grid grid-cols-1 gap-3">
                  {allMedicalTerms.map((term, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        isDarkMode
                          ? 'bg-gray-600/50'
                          : 'bg-white'
                      } ${
                        term.inReport1 && term.inReport2
                          ? ''
                          : term.inReport1
                          ? 'border-l-4 border-red-500'
                          : 'border-l-4 border-green-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="font-medium">{term.term}</span>
                          <p className={`mt-1 text-sm ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            {term.explanation}
                          </p>
                        </div>
                        <div className="text-xs space-y-1">
                          {term.inReport1 && (
                            <span className={`inline-block px-2 py-1 rounded ${
                              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                              Report 1
                            </span>
                          )}
                          {term.inReport2 && (
                            <span className={`inline-block px-2 py-1 rounded ${
                              isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                            }`}>
                              Report 2
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportComparison;