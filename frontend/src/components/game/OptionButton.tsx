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
      className={`w-full min-h-[46px] xs:min-h-[50px] sm:min-h-[56px] md:min-h-[64px] p-2 xs:p-2.5 sm:p-3 md:p-3.5 flex items-center justify-between text-left transition-all duration-150 cursor-pointer ${btnClasses}`}
    >
      <div className="flex items-center space-x-2 xs:space-x-2.5 sm:space-x-3 w-full pr-1">
        {/* Letter Key Square A, B, C, D */}
        <span
          className={`w-7 h-7 xs:w-8 xs:h-8 sm:w-8 sm:h-8 flex items-center justify-center font-mono font-bold text-xs xs:text-sm sm:text-sm shrink-0 border transition-colors ${
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
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-success text-white flex items-center justify-center">
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
            </div>
          )}
          {isSelected && !isCorrect && (
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-error text-white flex items-center justify-center">
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
            </div>
          )}
        </div>
      )}
    </motion.button>
  );
};
