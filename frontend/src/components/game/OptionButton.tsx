import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Option, AnimationStyle } from '../../types';
import { ScrambleText } from '../ui/ScrambleText';

import { soundFx } from '../../lib/sound';

interface OptionButtonProps {
  option: Option;
  index: number;
  selectedKey: string | null;
  isAnswered: boolean;
  animasiStyle: AnimationStyle;
  onSelect: (key: string) => void;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  option,
  index,
  selectedKey,
  isAnswered,
  animasiStyle,
  onSelect
}) => {
  const isSelected = selectedKey === option.key;
  const isCorrect = option.isCorrect;
  const hasMatrix = animasiStyle === 'combo' || animasiStyle === 'combo_matrix_overdrive' || animasiStyle === 'combo_grand_stand';

  // Tactile styling matching bespoke dark navy system
  let btnClasses = 'bg-[#0f1728] border-2 border-[#1e2b46] text-[#f8fafc] shadow-tactile-sm hover:border-[#2563eb] hover:bg-[#15223c] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-tactile-blue active:translate-x-[1px] active:translate-y-[1px] active:shadow-none';

  if (isAnswered) {
    if (isCorrect) {
      btnClasses = 'bg-[#052e16] border-2 border-[#10b981] text-[#f8fafc] shadow-tactile-emerald';
    } else if (isSelected && !isCorrect) {
      btnClasses = 'bg-[#4c0519] border-2 border-[#f43f5e] text-[#f8fafc] shadow-tactile-coral';
    } else {
      btnClasses = 'bg-[#080d16] border-2 border-[#162238] text-[#64748b] opacity-40';
    }
  }

  return (
    <motion.button
      type="button"
      disabled={isAnswered}
      onMouseEnter={() => {
        if (!isAnswered) {
          soundFx.playOptionHover(index);
        }
      }}
      onClick={() => {
        soundFx.playClick();
        onSelect(option.key);
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        x: isAnswered && isSelected && !isCorrect ? [0, -6, 6, -4, 4, 0] : 0
      }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 350, damping: 25 }}
      className={`w-full min-h-[46px] xs:min-h-[50px] sm:min-h-[56px] md:min-h-[64px] p-2 xs:p-2.5 sm:p-3 md:p-3.5 flex items-center justify-between text-left transition-all duration-150 cursor-pointer ${btnClasses}`}
    >
      <div className="flex items-center space-x-2 xs:space-x-2.5 sm:space-x-3 w-full pr-1">
        {/* Letter Key Square A, B, C, D */}
        <span
          className={`w-7 h-7 xs:w-8 xs:h-8 sm:w-8 sm:h-8 flex items-center justify-center font-mono font-bold text-xs xs:text-sm sm:text-sm shrink-0 border transition-colors ${
            isAnswered && isCorrect
              ? 'bg-[#10b981] text-[#080c14] border-[#34d399]'
              : isAnswered && isSelected && !isCorrect
              ? 'bg-[#f43f5e] text-white border-[#fb7185]'
              : 'bg-[#18243b] text-[#cbd5e1] border-[#273b5e]'
          }`}
        >
          {option.key}
        </span>

        {/* Option Text */}
        <span className="text-[11.5px] xs:text-[12.5px] sm:text-sm md:text-base font-bold sm:font-semibold leading-tight sm:leading-snug flex-1 line-clamp-2">
          {hasMatrix && !isAnswered ? (
            <ScrambleText text={option.text} speed={20} />
          ) : (
            option.text
          )}
        </span>
      </div>

      {/* Answer Status Icon */}
      {isAnswered && (
        <div className="shrink-0 ml-1 sm:ml-2">
          {isCorrect && (
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#10b981] text-[#080c14] flex items-center justify-center">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
            </div>
          )}
          {isSelected && !isCorrect && (
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-[#f43f5e] text-white flex items-center justify-center">
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
            </div>
          )}
        </div>
      )}
    </motion.button>
  );
};
