import React from 'react';
import { motion } from 'framer-motion';

interface GlowingTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export const GlowingText: React.FC<GlowingTextProps> = ({ text, className = '', delay = 0 }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`relative inline-block ${className}`}
    >
      <span className="absolute inset-0 blur-lg bg-gradient-to-r from-blue-500 to-green-500 opacity-50" />
      <span className="relative">{text}</span>
    </motion.span>
  );
};