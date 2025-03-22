import React, { useState, useRef, useContext, useEffect, useMemo } from 'react';
import { FileUpload } from './FileUpload';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, GitCompare, AlertCircle, ArrowLeft } from 'lucide-react';
import { ThemeContext } from '../App';
import DocumentProcessor, { ProcessedDocument } from '../lib/documentProcessor';
import { v4 as uuidv4 } from 'uuid';
import ReportComparison from './ReportComparison';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';

export interface Report extends ProcessedDocument {
  id: string;
  relevanceScore?: number;
}

const SearchBarPage: React.FC = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [highlightedReport, setHighlightedReport] = useState<Report | null>(null);
  const [searchMatches, setSearchMatches] = useState<{[key: string]: number[]}>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  const documentProcessor = DocumentProcessor.getInstance();

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const loadedReports = await documentProcessor.loadReports();
        setReports(loadedReports.map(report => ({
          ...report,
          id: uuidv4() // Assign a temporary ID for UI purposes
        })));
      } catch (err) {
        console.error('Error loading reports:', err);
        setError('Failed to load reports. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const handleFileSelect = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      const processedDoc = await documentProcessor.processFile(file);
      const newReport: Report = {
        ...processedDoc,
        id: uuidv4()
      };
      setReports(prevReports => [newReport, ...prevReports]);
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Failed to process the file. Please try again with a different file.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
          setSuggestions([]);
          setSearchMatches({});
          return;
        }

        try {
          const { reports: searchResults, relevanceScores: scores } = 
            await documentProcessor.searchReports(query);
          
          const processedReports: Report[] = searchResults.map(report => ({
            ...report,
            id: report.id || uuidv4(),
            relevanceScore: report.id ? scores[report.id] : 0
          }));

          setReports(processedReports);

          // Update suggestions based on keywords from top results
          const topKeywords = new Set<string>();
          processedReports.slice(0, 3).forEach(report => {
            report.keywords?.forEach(keyword => {
              if (keyword.toLowerCase().includes(query.toLowerCase())) {
                topKeywords.add(keyword);
              }
            });
          });
          setSuggestions(Array.from(topKeywords).slice(0, 5));

          // Highlight the most relevant report
          if (processedReports.length > 0) {
            setHighlightedReport(processedReports[0]);
          }
        } catch (err) {
          console.error('Error searching reports:', err);
          setError('Failed to search reports. Please try again.');
        }
      }, 300),
    []
  );

  const handleCompare = () => {
    if (selectedReports.length !== 2) {
      alert('Please select exactly 2 reports to compare');
      return;
    }
    setCompareMode(true);
  };

  if (compareMode && selectedReports.length === 2) {
    return (
      <ReportComparison
        reports={selectedReports as [Report, Report]}
        onBack={() => setCompareMode(false)}
      />
    );
  }

  // Cleanup OCR worker on component unmount
  useEffect(() => {
    return () => {
      documentProcessor.cleanup();
    };
  }, []);

  const toggleReportSelection = (report: Report) => {
    if (selectedReports.includes(report)) {
      setSelectedReports(selectedReports.filter(r => r.id !== report.id));
    } else if (selectedReports.length < 2) {
      setSelectedReports([...selectedReports, report]);
    }
  };

  const renderReportContent = (report: Report) => {
    return (
      <div className="space-y-4">
        {report.summary && (
          <div className={`text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <span className="font-medium">Summary:</span> {report.summary}
          </div>
        )}
        
        {report.keywords && report.keywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {report.keywords.map((keyword, idx) => (
              <span
                key={idx}
                className={`text-xs px-2 py-1 rounded-full ${
                  isDarkMode
                    ? 'bg-gray-600 text-gray-200'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {keyword}
              </span>
            ))}
          </div>
        )}

        <div className={`mt-2 text-sm ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {searchQuery ? (
            <>
              {renderHighlightedContent(report)}
              {report.relevanceScore !== undefined && (
                <div className="mt-1 text-xs text-blue-500">
                  Relevance: {(report.relevanceScore * 100).toFixed(1)}%
                </div>
              )}
            </>
          ) : (
            <>
              <div className="line-clamp-3">{report.content}</div>
              {report.simplifiedContent && (
                <div className="mt-4 p-4 rounded-lg bg-opacity-50 border border-opacity-20 space-y-2">
                  <h4 className={`font-medium ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-600'
                  }`}>
                    Simplified Version
                  </h4>
                  <p className="line-clamp-3">{report.simplifiedContent}</p>
                </div>
              )}
              {report.medicalTerms && report.medicalTerms.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className={`font-medium ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-600'
                  }`}>
                    Medical Terms
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {report.medicalTerms.map((term, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded ${
                          isDarkMode
                            ? 'bg-gray-700/50 hover:bg-gray-700'
                            : 'bg-gray-100/50 hover:bg-gray-100'
                        } transition-colors`}
                      >
                        <span className="font-medium">{term.term}:</span>{' '}
                        <span className="text-sm">{term.explanation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderHighlightedContent = (report: Report) => {
    if (!searchQuery.trim() || !searchMatches[report.id]) {
      return report.content;
    }

    const positions = searchMatches[report.id];
    const chunks: JSX.Element[] = [];
    let lastIndex = 0;

    positions.forEach((pos, i) => {
      // Add text before match
      if (pos > lastIndex) {
        chunks.push(
          <span key={`pre-${i}`}>
            {report.content.slice(lastIndex, pos)}
          </span>
        );
      }

      // Add highlighted match
      const matchEnd = pos + searchQuery.length;
      chunks.push(
        <span 
          key={`match-${i}`}
          className={isDarkMode ? 'bg-blue-900' : 'bg-blue-200'}
        >
          {report.content.slice(pos, matchEnd)}
        </span>
      );

      lastIndex = matchEnd;
    });

    // Add remaining text
    if (lastIndex < report.content.length) {
      chunks.push(
        <span key="rest">
          {report.content.slice(lastIndex)}
        </span>
      );
    }

    return chunks;
  };

  const renderReportList = () => (
    <ul className="space-y-2">
      {reports.map((report) => (
        <li
          key={report.id}
          onClick={() => toggleReportSelection(report)}
          className={`p-4 rounded-lg cursor-pointer transition-all ${
            selectedReports.includes(report)
              ? 'bg-blue-100 border-blue-500'
              : isDarkMode 
                ? 'bg-gray-600 hover:bg-gray-500' 
                : 'bg-white hover:bg-gray-100'
          } ${
            selectedReports.length === 2 && !selectedReports.includes(report)
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
        >
          <div className={`font-medium ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Report from {report.timestamp.toLocaleDateString()}
          </div>
          <div className={`text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Source: {report.source}
          </div>
          {(highlightedReport?.id === report.id || selectedReports.includes(report)) && (
            <div className={`mt-2 text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {renderReportContent(report)}
            </div>
          )}
        </li>
      ))}
    </ul>
  );

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
          <div className="flex items-center justify-between gap-4 mb-6">
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
              <h1 className={`text-3xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>
                Compare Medical Reports
              </h1>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                  isDarkMode ? 'bg-red-900/50 text-red-100' : 'bg-red-100 text-red-800'
                }`}
              >
                <AlertCircle className="h-5 w-5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search in reports..."
                  className={`w-full rounded-lg border py-3 px-5 pl-12 ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-800'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <Search className={`absolute left-4 top-3.5 h-5 w-5 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>

              <FileUpload onFileSelect={handleFileSelect} />

              {suggestions.length > 0 && (
                <div className={`rounded-lg p-4 ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <h3 className={`font-semibold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>
                    Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className={`cursor-pointer hover:bg-blue-100 rounded p-2 ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}
                        onClick={() => setSearchQuery(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className={`rounded-lg p-4 ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>
                  Selected Reports ({selectedReports.length}/2)
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCompare}
                  disabled={selectedReports.length !== 2 || loading}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    selectedReports.length === 2 && !loading
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <GitCompare size={20} />
                  {loading ? 'Processing...' : 'Compare'}
                </motion.button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : reports.length === 0 ? (
                <div className={`text-center py-8 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  No reports uploaded yet. Use the file upload above to add reports.
                </div>
              ) : (
                renderReportList()
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SearchBarPage;
