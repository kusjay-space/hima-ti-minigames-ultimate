import React, { useEffect, useState } from 'react';

interface ScrambleTextProps {
  text: string;
  enabled?: boolean;
  className?: string;
  speed?: number;
}

const CHARS = '!@#$%^&*()_+~`|}{[]:;?><,./-=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  enabled = true,
  className = '',
  speed = 25
}) => {
  const [displayText, setDisplayText] = useState(enabled ? '' : text);

  useEffect(() => {
    if (!enabled) {
      setDisplayText(text);
      return;
    }

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(interval);
      }

      iteration += 1 / 2;
    }, speed);

    return () => clearInterval(interval);
  }, [text, enabled, speed]);

  return <span className={className}>{displayText}</span>;
};
