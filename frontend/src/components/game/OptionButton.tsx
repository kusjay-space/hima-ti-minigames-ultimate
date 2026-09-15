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

  // Semantic tactile styling matching the design tokens
  let btnClasses = 'bg-default border-2 border-default text-default shadow-tactile-sm hover:border-primary hover:bg-subtle hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-tactile-blue active:translate-x-[1px] active:translate-y-[1px] active:shadow-none';

  if (isAnswered) {
    if (isCorrect) {
      btnClasses = 'bg-success/15 border-2 border-success text-default shadow-tactile-emerald';
    } else if (isSelected && !isCorrect) {
      btnClasses = 'bg-error/15 border-2 border-error text-default shadow-tactile-coral';
    } else {
      btnClasses = 'bg-muted/40 border-2 border-subtle text-muted opacity-40';
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
      className={`w-full min-h-[52px] xs:min-h-[58px] sm:min-h-[70px] md:min-h-[82px] lg:min-h-[92px] p-2.5 xs:p-3 sm:p-3.5 md:p-4 lg:p-5 flex items-center justify-between text-left transition-all duration-150 cursor-pointer ${btnClasses}`}
    >
      <div className="flex items-center space-x-2.5 xs:space-x-3 sm:space-x-4 w-full pr-1">
        {/* Letter Key Square A, B, C, D */}
        <span
          className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 lg:w-14 lg:h-14 flex items-center justify-center font-mono font-black text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl shrink-0 border-2 transition-colors ${
            isAnswered && isCorrect
              ? 'bg-success text-white border-success'
              : isAnswered && isSelected && !isCorrect
              ? 'bg-error text-white border-error'
              : 'bg-subtle text-subtle border-default'
          }`}
        >
          {option.key}
        </span>

        {/* Option Text */}
        <span className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-tight sm:leading-snug flex-1 line-clamp-2">
          {hasMatrix && !isAnswered ? (
            <ScrambleText text={option.text} speed={20} />
          ) : (
            option.text
          )}
        </span>
      </div>

      {/* Answer Status Icon */}
      {isAnswered && (
        <div className="shrink-0 ml-1.5 sm:ml-2.5 md:ml-3">
          {isCorrect && (
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 bg-success text-white flex items-center justify-center">
              <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-[3]" />
            </div>
          )}
          {isSelected && !isCorrect && (
            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 bg-error text-white flex items-center justify-center">
              <X className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-[3]" />
            </div>
          )}
        </div>
      )}
    </motion.button>
  );
};
