import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, FileText, Share2, Volume2, Sun, Moon } from 'lucide-react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Float, Center, PerspectiveCamera } from '@react-three/drei';
import { useContext } from 'react';
import { ThemeContext } from '../App';
import { DNAHelix, FloatingPills } from './3DElements';
import { GlowingText } from './GlowingText';
import SearchBar from './Searchbar';
import { useNavigate } from 'react-router-dom';

const Feature = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => {
  const { isDarkMode } = useContext(ThemeContext);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`p-6 rounded-2xl backdrop-blur-lg ${
        isDarkMode 
          ? 'bg-gray-800/50 hover:bg-gray-700/50' 
          : 'bg-white/50 hover:bg-white/80'
      } transition-all duration-300 hover:shadow-xl`}
    >
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
    </motion.div>
  );
};

const Background3D = () => {
  const { isDarkMode } = useContext(ThemeContext);
  
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 10]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <Center>
          <DNAHelix />
          <FloatingPills />
        </Center>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        <fog attach="fog" args={[isDarkMode ? '#111827' : '#ffffff', 8, 25]} />
      </Canvas>
    </div>
  );
};

export const LandingPage = () => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Background3D />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="absolute top-6 right-6">
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

        <div className="text-center mb-20 relative">
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full" />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <GlowingText
              text="Check आरोग्य"
              className={`text-5xl md:text-7xl font-bold font-marathi ${
                isDarkMode ? 'text-white' : 'text-blue-900'
              }`}
            />
            <GlowingText
              text=""
              delay={0.2}
              className={`text-5xl md:text-7xl font-bold mt-2 ${
                isDarkMode ? 'text-white' : 'text-blue-900'
              }`}
            />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-xl md:text-2xl mb-8 mt-6 relative ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
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
              onClick={() => navigate('/translate')}
              className="relative btn-primary flex items-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">Get Started</span>
              <ArrowRight size={20} className="relative" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/compare')}
              className="relative btn-primary flex items-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <span className="relative">Compare Reports</span>
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
          <Feature
            icon={Brain}
            title="AI-Powered Translation"
            description="Advanced AI technology converts complex medical terms into simple, understandable language."
          />
          <Feature
            icon={FileText}
            title="Smart Summaries"
            description="Get instant, easy-to-read summaries of your medical documents with key points highlighted."
          />
          <Feature
            icon={Volume2}
            title="Audio Explanations"
            description="Listen to your medical reports with text-to-speech functionality for better accessibility."
          />
          <Feature
            icon={Share2}
            title="Easy Sharing"
            description="Share simplified reports with family members or healthcare providers securely."
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className={`rounded-3xl p-8 md:p-12 ${
            isDarkMode 
              ? 'bg-gray-800/50 backdrop-blur-lg' 
              : 'bg-white/50 backdrop-blur-lg'
          }`}
        >
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
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
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className={`relative ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}
              >
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className={`${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};