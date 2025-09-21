import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: React.ReactNode;
}

const AnimatedSection: React.FC<Props> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }} // Estado inicial: invisível e 50px para baixo
      whileInView={{ opacity: 1, y: 0 }} // Anima para: totalmente visível e na posição original
      viewport={{ once: true }} // A animação ocorre apenas uma vez
      transition={{ duration: 0.6, ease: 'easeOut' }} // Duração e tipo da animação
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;