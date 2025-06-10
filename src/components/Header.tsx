
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import SideNav from './SideNav';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <header className="bg-white border-b border-tixapp-gray shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 px-4 max-w-screen-xl mx-auto">
        {/* Hamburger Menu */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-touch-target min-w-touch-target hover:bg-tixapp-gray/50 focus:ring-2 focus:ring-tixapp-teal focus:ring-offset-2"
              aria-label="Open navigation menu"
            >
              <Menu className="h-6 w-6 text-tixapp-navy" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SideNav onItemClick={() => setIsMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="flex items-center">
          <button
            onClick={handleHomeClick}
            className="text-2xl font-bold text-tixapp-navy tracking-tight hover:text-tixapp-teal focus:outline-none focus:ring-2 focus:ring-tixapp-teal focus:ring-offset-2 rounded px-2 py-1"
            aria-label="Go to home page"
          >
            TixApp
          </button>
        </div>

        {/* Profile Shortcut */}
        <Button
          variant="ghost"
          size="icon"
          className="min-h-touch-target min-w-touch-target hover:bg-tixapp-gray/50 focus:ring-2 focus:ring-tixapp-teal focus:ring-offset-2"
          aria-label="User profile"
        >
          <User className="h-6 w-6 text-tixapp-navy" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
