import React from 'react';
import { Check } from 'lucide-react';

interface BrandProps {
  className?: string;
  light?: boolean;
}

export const Brand: React.FC<BrandProps> = ({ className = '', light = false }) => {
  return (
    <div className={`brand ${light ? 'light' : ''} ${className}`}>
      <span className="brand-mark">
        <Check size={22} strokeWidth={3.5} />
      </span>
      attendly
      <span className="brand-period">.</span>
    </div>
  );
};
