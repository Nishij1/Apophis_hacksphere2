import React from 'react';
import { Download, Share2, Printer, Volume2 } from 'lucide-react';

interface SimplifiedReportProps {
  originalText: string;
  simplifiedText: string;
  medicalTerms: Array<{
    term: string;
    explanation: string;
  }>;
}

export const SimplifiedReport: React.FC<SimplifiedReportProps> = ({
  originalText,
  simplifiedText,
  medicalTerms,
}) => {
  const handleExport = () => {
    // TODO: Implement PDF export functionality
    console.log('Exporting to PDF...');
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Sharing report...');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReadAloud = () => {
    // TODO: Implement text-to-speech functionality
    const utterance = new SpeechSynthesisUtterance(simplifiedText);
    window.speechSynthesis.speak(utterance);
  };

  const highlightMedicalTerms = (text: string) => {
    let highlightedText = text;
    medicalTerms.forEach(({ term, explanation }) => {
      const regex = new RegExp(term, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        `<span class="bg-yellow-100 cursor-help" title="${explanation}">${term}</span>`
      );
    });
    return highlightedText;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-blue-600 mb-4">
        Simplified Version
      </h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-2">
          Your simplified text will appear here. Medical terms will be{' '}
          <span className="bg-yellow-100">highlighted</span> for easy understanding.
        </p>
        
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: highlightMedicalTerms(simplifiedText),
          }}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Download size={20} />
          Export
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Share2 size={20} />
          Share
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Printer size={20} />
          Print
        </button>

        <button
          onClick={handleReadAloud}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Volume2 size={20} />
          Read Aloud
        </button>
      </div>
    </div>
  );
}; 