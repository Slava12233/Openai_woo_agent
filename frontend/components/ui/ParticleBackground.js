'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ParticleBackground() {
  // שימוש ב-useState כדי לשמור את החלקיקים והקווים
  const [particles, setParticles] = useState([]);
  const [lines, setLines] = useState([]);
  
  // יצירת החלקיקים רק בצד הלקוח
  useEffect(() => {
    // יצירת מערך של חלקיקים עם מיקום ומאפיינים אקראיים
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.5 + 0.1,
    }));
    
    setParticles(newParticles);
  }, []);
  
  // יצירת קווים בין חלקיקים קרובים
  useEffect(() => {
    if (particles.length === 0) return;
    
    const newLines = [];
    const maxDistance = 15; // מרחק מקסימלי בין חלקיקים ליצירת קו

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        
        // חישוב מרחק בין חלקיקים
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < maxDistance) {
          // חישוב שקיפות הקו לפי המרחק
          const opacity = 0.2 * (1 - distance / maxDistance);
          
          newLines.push({
            id: `${p1.id}-${p2.id}`,
            x1: `${p1.x}%`,
            y1: `${p1.y}%`,
            x2: `${p2.x}%`,
            y2: `${p2.y}%`,
            opacity,
          });
        }
      }
    }
    
    setLines(newLines);
  }, [particles]);

  // אנימציה לחלקיקים
  const particleVariants = {
    animate: (custom) => ({
      y: [custom.y, custom.y - 10, custom.y],
      opacity: [custom.opacity, custom.opacity + 0.2, custom.opacity],
      transition: {
        duration: 4 / custom.speed,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    }),
  };

  // אם אנחנו בצד השרת או שהחלקיקים עדיין לא נוצרו, נחזיר div ריק
  if (typeof window === 'undefined' || particles.length === 0) {
    return <div className="particles-container" />;
  }

  return (
    <div className="particles-container">
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* קווים בין חלקיקים */}
        {lines.map((line) => (
          <line
            key={line.id}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="rgba(59, 130, 246, 0.2)"
            strokeWidth="0.5"
            strokeOpacity={line.opacity}
          />
        ))}
      </svg>

      {/* חלקיקים */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-accent-primary"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
          }}
          custom={particle}
          variants={particleVariants}
          animate="animate"
        />
      ))}

      {/* גרדיאנט רקע */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent to-bg-primary opacity-80" />
    </div>
  );
} 