import React, { ReactNode, useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';

interface NativeButtonProps {
  children: ReactNode;
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
  pressedClassName?: string;
  size?: 'icon' | 'default';
}

const NativeButton: React.FC<NativeButtonProps> = ({
  children,
  onClick,
  className = '',
  ariaLabel,
  pressedClassName = 'bg-tixapp-teal/20 scale-95',
  size = 'icon'
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const isNative = Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android';

  const handleTouchStart = useCallback(() => {
    if (isNative) {
      setIsPressed(true);
    }
  }, [isNative]);

  const handleTouchEnd = useCallback(() => {
    if (isNative) {
      setIsPressed(false);
      onClick();
    }
  }, [isNative, onClick]);

  const handleClick = useCallback(() => {
    if (!isNative) {
      onClick();
    }
  }, [isNative, onClick]);

  const baseClasses = size === 'icon' 
    ? 'min-h-touch-target min-w-touch-target p-2 rounded-md' 
    : 'min-h-touch-target px-2 py-1 rounded';

  const interactionClasses = isNative
    ? 'transition-all duration-150 active:scale-95'
    : 'hover:bg-tixapp-gray/50 focus:ring-2 focus:ring-tixapp-teal focus:ring-offset-2';

  const pressedClasses = isPressed ? pressedClassName : '';

  const combinedClasses = `${baseClasses} ${interactionClasses} ${pressedClasses} ${className}`;

  const nativeStyles = isNative ? {
    WebkitTapHighlightColor: 'transparent',
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
    userSelect: 'none',
    cursor: 'pointer',
  } : {};

  return (
    <button
      className={combinedClasses}
      style={nativeStyles}
      aria-label={ariaLabel}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={() => setIsPressed(false)}
      // Prevent context menu on long press
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
};

export default NativeButton;