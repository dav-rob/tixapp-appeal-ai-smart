
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNav from './SideNav';
import { useNativeHeader } from '@/hooks/useNativeHeader';
import NativeButton from './NativeButton';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleMenuPress = () => {
    setIsMenuOpen(true);
  };

  const handleProfilePress = () => {
    // Handle profile action
    console.log('Profile pressed');
  };

  // Configure native header
  const { isNativePlatform } = useNativeHeader(
    {
      title: 'Tix Appeal',
      showMenuButton: true,
      showProfileButton: true,
      backgroundColor: '#ffffff',
      textColor: 'dark',
    },
    {
      onMenuPress: handleMenuPress,
      onBackPress: () => navigate(-1),
      onProfilePress: handleProfilePress,
      onTitlePress: handleHomeClick,
    }
  );

  // Removed useNativeHeaderButtons - now using NativeButton component

  return (
    <header className="bg-white border-b border-tixapp-gray shadow-sm sticky z-50"
      style={{
        top: isNativePlatform ? '25px' : '0px'
      }}>
      <div className="flex items-center justify-between h-16 px-4 max-w-screen-xl mx-auto">
        {/* Hamburger Menu */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            {isNativePlatform ? (
              <NativeButton
                onClick={handleMenuPress}
                ariaLabel="Open navigation menu"
                size="icon"
              >
                <Menu className="h-6 w-6 text-tixapp-navy" />
              </NativeButton>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="min-h-touch-target min-w-touch-target hover:bg-tixapp-gray/50 focus:ring-2 focus:ring-tixapp-teal focus:ring-offset-2"
                aria-label="Open navigation menu"
              >
                <Menu className="h-6 w-6 text-tixapp-navy" />
              </Button>
            )}
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-80 p-0"
            style={{
              top: isNativePlatform ? '25px' : '0px'
            }}
          >
            <SideNav onItemClick={() => setIsMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="flex items-center">
          {isNativePlatform ? (
            <NativeButton
              onClick={handleHomeClick}
              ariaLabel="Go to home page"
              size="default"
              className="text-2xl font-bold text-tixapp-navy tracking-tight"
              pressedClassName="text-tixapp-teal scale-95"
            >
              Tix Appeal
            </NativeButton>
          ) : (
            <button
              onClick={handleHomeClick}
              className="text-2xl font-bold text-tixapp-navy tracking-tight hover:text-tixapp-teal focus:outline-none focus:ring-2 focus:ring-tixapp-teal focus:ring-offset-2 rounded px-2 py-1 min-h-touch-target"
              aria-label="Go to home page"
            >
              Tix Appeal
            </button>
          )}
        </div>

        {/* Profile Shortcut */}
        {isNativePlatform ? (
          <NativeButton
            onClick={handleProfilePress}
            ariaLabel="User profile"
            size="icon"
          >
            <User className="h-6 w-6 text-tixapp-navy" />
          </NativeButton>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="min-h-touch-target min-w-touch-target hover:bg-tixapp-gray/50 focus:ring-2 focus:ring-tixapp-teal focus:ring-offset-2"
            aria-label="User profile"
          >
            <User className="h-6 w-6 text-tixapp-navy" />
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
