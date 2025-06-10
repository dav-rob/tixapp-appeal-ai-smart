
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, HelpCircle, Users, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SideNavProps {
  onItemClick: () => void;
}

const SideNav = ({ onItemClick }: SideNavProps) => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: HelpCircle, label: 'FAQ', href: '/faq' },
    { icon: Users, label: 'Our Team', href: '/team' },
    { icon: Mail, label: 'Contact Us', href: '/contact' },
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
    onItemClick();
  };

  return (
    <nav className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-tixapp-gray">
        <h2 className="text-xl font-semibold text-tixapp-navy">TixApp</h2>
        <p className="text-sm text-gray-600 mt-1">Scan. Appeal. Win.</p>
      </div>

      {/* Menu Items */}
      <div className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className="w-full justify-start h-12 px-4 text-left hover:bg-tixapp-teal/10 hover:text-tixapp-navy focus:ring-2 focus:ring-tixapp-teal focus:ring-offset-2"
            onClick={() => handleNavigation(item.href)}
            aria-label={`Navigate to ${item.label}`}
          >
            <item.icon className="h-5 w-5 mr-3 text-tixapp-teal" />
            <span className="text-base">{item.label}</span>
          </Button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-tixapp-gray">
        <p className="text-xs text-gray-500 text-center">
          © 2024 TixApp. All rights reserved.
        </p>
      </div>
    </nav>
  );
};

export default SideNav;
