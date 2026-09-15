import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface TimerBarProps {
  timeLeft: number;
  totalTime: number;
}

export const TimerBar: React.FC<TimerBarProps> = ({ timeLeft, totalTime }) => {
  const percentage = Math.max(0, (timeLeft / totalTime) * 100);
  const isCritical = timeLeft <= 3 && timeLeft > 0;

  let barColor = 'bg-primary';
  if (timeLeft <= 3) {
    barColor = 'bg-error';
  } else if (timeLeft <= 5) {
    barColor = 'bg-warning';
  }

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center justify-between text-xs font-mono mb-1 px-0.5">
        <div className="flex items-center gap-1.5 text-muted">
          <Clock className={`w-3.5 h-3.5 ${isCritical ? 'text-error animate-spin' : 'text-primary'}`} />
          <span className="text-[10px] sm:text-[11px] tracking-wider uppercase font-bold">TIMER:</span>
        </div>

        <motion.div
          key={timeLeft}
          animate={isCritical ? { scale: [1, 1.15, 1] } : {}}
          className={`font-bold font-mono text-xs px-2 py-0.5 border ${
            isCritical 
              ? 'bg-error/15 text-error border-error' 
              : 'bg-default text-default border-default shadow-sm'
          }`}
        >
          {timeLeft}s
        </motion.div>
      </div>

      {/* Sharp Rectangular Progress Track */}
      <div className="w-full h-2.5 bg-muted border border-default overflow-hidden relative shadow-inner">
        <motion.div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
