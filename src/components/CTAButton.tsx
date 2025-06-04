
import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface CTAButtonProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const CTAButton = ({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  variant = 'primary',
  className = '' 
}: CTAButtonProps) => {
  const isPrimary = variant === 'primary';
  
  return (
    <Button
      onClick={onClick}
      className={`
        w-full h-auto p-6 flex flex-col items-center text-center space-y-3
        min-h-touch-target transition-all duration-200 ease-in-out
        hover:transform hover:scale-[1.02] focus:scale-[1.02]
        ${isPrimary 
          ? 'bg-tixapp-navy hover:bg-tixapp-navy-light focus:bg-tixapp-navy-light text-white' 
          : 'bg-tixapp-teal hover:bg-tixapp-teal-light focus:bg-tixapp-teal-light text-white'
        }
        border-2 border-transparent focus:border-white focus:ring-2 focus:ring-offset-2
        ${isPrimary ? 'focus:ring-tixapp-teal' : 'focus:ring-tixapp-navy'}
        shadow-lg hover:shadow-xl
        ${className}
      `}
      aria-label={`${title}: ${description}`}
    >
      <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full">
        <Icon className="h-8 w-8" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm opacity-90 mt-1">{description}</p>
      </div>
    </Button>
  );
};

export default CTAButton;
