import { useEffect, useState, useCallback } from 'react';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

export interface NativeHeaderConfig {
  title: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showProfileButton?: boolean;
  backgroundColor?: string;
  textColor?: 'light' | 'dark';
}

export interface NativeHeaderEvents {
  onMenuPress: () => void;
  onBackPress: () => void;
  onProfilePress: () => void;
  onTitlePress: () => void;
}

export const useNativeHeader = (config: NativeHeaderConfig, events: NativeHeaderEvents) => {
  const [isNativePlatform, setIsNativePlatform] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Check if we're on a native platform
  useEffect(() => {
    const checkPlatform = async () => {
      const platform = Capacitor.getPlatform();
      setIsNativePlatform(platform === 'ios' || platform === 'android');
      setIsReady(true);
    };
    
    checkPlatform();
  }, []);

  // Configure status bar
  useEffect(() => {
    if (!isNativePlatform) return;

    const configureStatusBar = async () => {
      try {
        await StatusBar.setStyle({
          style: config.textColor === 'light' ? Style.Dark : Style.Light,
        });
        
        if (config.backgroundColor) {
          await StatusBar.setBackgroundColor({
            color: config.backgroundColor,
          });
        }
      } catch (error) {
        console.warn('StatusBar configuration failed:', error);
      }
    };

    configureStatusBar();
  }, [isNativePlatform, config.backgroundColor, config.textColor]);

  // Set up native event listeners
  useEffect(() => {
    if (!isNativePlatform) return;

    const setupEventListeners = async () => {
      // Listen for hardware back button (Android)
      const backHandler = App.addListener('backButton', (data) => {
        if (data.canGoBack) {
          events.onBackPress();
        }
      });

      // Custom event listeners for native header buttons
      // These would be triggered by native code we'll add later
      const menuHandler = App.addListener('menuButtonPressed', () => {
        events.onMenuPress();
      });

      const profileHandler = App.addListener('profileButtonPressed', () => {
        events.onProfilePress();
      });

      const titleHandler = App.addListener('titlePressed', () => {
        events.onTitlePress();
      });

      return () => {
        backHandler.remove();
        menuHandler.remove();
        profileHandler.remove();
        titleHandler.remove();
      };
    };

    setupEventListeners();
  }, [isNativePlatform, events]);

  // Trigger native events from React (for testing)
  const triggerNativeEvent = useCallback((eventName: string, data?: any) => {
    if (!isNativePlatform) return;
    
    // This would communicate with native code
    // For now, we'll use a simple event system
    const event = new CustomEvent(eventName, { detail: data });
    window.dispatchEvent(event);
  }, [isNativePlatform]);

  // Simulate native button press for testing
  const simulateNativePress = useCallback((buttonType: 'menu' | 'profile' | 'title') => {
    switch (buttonType) {
      case 'menu':
        events.onMenuPress();
        break;
      case 'profile':
        events.onProfilePress();
        break;
      case 'title':
        events.onTitlePress();
        break;
    }
  }, [events]);

  return {
    isNativePlatform,
    isReady,
    triggerNativeEvent,
    simulateNativePress,
  };
};

// Helper hook for native header buttons
export const useNativeHeaderButtons = () => {
  const [isPressed, setIsPressed] = useState<string | null>(null);

  const handlePress = useCallback((buttonId: string, callback: () => void) => {
    setIsPressed(buttonId);
    callback();
    
    // Reset pressed state after animation
    setTimeout(() => setIsPressed(null), 150);
  }, []);

  return {
    isPressed,
    handlePress,
  };
};