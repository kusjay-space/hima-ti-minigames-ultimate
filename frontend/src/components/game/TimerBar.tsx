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

  let barColor = 'bg-[#2563eb]';
  if (timeLeft <= 3) {
    barColor = 'bg-[#f43f5e]';
  } else if (timeLeft <= 5) {
    barColor = 'bg-[#f59e0b]';
  }

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center justify-between text-xs font-mono mb-1 px-0.5">
        <div className="flex items-center gap-1.5 text-[#94a3b8]">
          <Clock className={`w-3.5 h-3.5 ${isCritical ? 'text-[#f43f5e] animate-spin' : 'text-[#38bdf8]'}`} />
          <span className="text-[10px] sm:text-[11px] tracking-wider uppercase font-bold">TIMER:</span>
        </div>

        <motion.div
          key={timeLeft}
          animate={isCritical ? { scale: [1, 1.15, 1] } : {}}
          className={`font-bold font-mono text-xs px-2 py-0.5 border ${
            isCritical 
              ? 'bg-[#4c0519] text-[#f43f5e] border-[#f43f5e]' 
              : 'bg-[#0d1424] text-[#f8fafc] border-[#1e2b46]'
          }`}
        >
          {timeLeft}s
        </motion.div>
      </div>

      {/* Sharp Rectangular Progress Track */}
      <div className="w-full h-2.5 bg-[#080c14] border border-[#1e2b46] overflow-hidden relative shadow-inner">
        <motion.div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
