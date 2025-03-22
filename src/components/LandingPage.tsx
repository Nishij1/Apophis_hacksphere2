import { motion } from 'framer-motion';
import { ArrowRight, Brain, FileText, Share2, Volume2, Sun, Moon } from 'lucide-react';
import { useContext } from 'react';
import { ThemeContext } from '../App';
import { GlowingText } from './GlowingText';

interface FeatureProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const Feature = ({ icon: Icon, title, description }: FeatureProps) => {
  const { isDarkMode } = useContext(ThemeContext);
  
  const bgClasses = isDarkMode 
    ? 'bg-gray-800/50 hover:bg-gray-700/50' 
    : 'bg-white/50 hover:bg-white/80';

  const textClasses = isDarkMode ? 'text-white' : 'text-gray-800';
  const descClasses = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`p-6 rounded-2xl backdrop-blur-lg ${bgClasses} transition-all duration-300 hover:shadow-xl`}
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className={`text-xl font-semibold mb-2 ${textClasses}`}>{title}</h3>
      <p className={descClasses}>{description}</p>
    </motion.div>
  );
};

const features = [
  {
    icon: Brain,
    title: "AI-Powered Translation",
    description: "Advanced AI technology converts complex medical terms into simple, understandable language."
  },
  {
    icon: FileText,
    title: "Smart Summaries",
    description: "Get instant, easy-to-read summaries of your medical documents with key points highlighted."
  },
  {
    icon: Volume2,
    title: "Audio Explanations",
    description: "Listen to your medical reports with text-to-speech functionality for better accessibility."
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share simplified reports with family members or healthcare providers securely."
  }
];

const steps = [
  {
    step: "1",
    title: "Upload Your Document",
    description: "Simply upload your medical report, prescription, or any medical document."
  },
  {
    step: "2",
    title: "AI Processing",
    description: "Our AI analyzes the document and identifies complex medical terms."
  },
  {
    step: "3",
    title: "Get Simple Explanations",
    description: "Receive easy-to-understand explanations and summaries instantly."
  }
];

export const LandingPage = () => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  const buttonClasses = isDarkMode 
    ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
    : 'bg-white text-gray-800 shadow-lg hover:shadow-xl';

  const titleClasses = isDarkMode ? 'text-white' : 'text-blue-900';
  const subtitleClasses = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const containerClasses = isDarkMode 
    ? 'bg-gray-800/50 backdrop-blur-lg' 
    : 'bg-white/50 backdrop-blur-lg';

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="absolute top-6 right-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleDarkMode}
            className={`p-3 rounded-full transition-all duration-300 ${buttonClasses}`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
          </motion.button>
        </div>

        <div className="text-center mb-20 relative">
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full" />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <GlowingText
              text="Medical Jargon"
              className={`text-5xl md:text-7xl font-bold ${titleClasses}`}
            />
            <GlowingText
              text="Translator"
              delay={0.2}
              className={`text-5xl md:text-7xl font-bold mt-2 ${titleClasses}`}
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-xl md:text-2xl mb-8 mt-6 relative ${subtitleClasses}`}
          >
            Transform complex medical documents into patient-friendly content using AI
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative btn-primary flex items-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">Get Started</span>
              <ArrowRight size={20} className="relative" />
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {features.map((feature, index) => (
            <Feature key={index} {...feature} />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className={`rounded-3xl p-8 md:p-12 ${containerClasses}`}
        >
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${titleClasses}`}>
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`relative ${subtitleClasses}`}
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className={subtitleClasses}>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};