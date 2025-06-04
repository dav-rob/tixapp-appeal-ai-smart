
import React, { useState } from 'react';
import { Camera } from 'lucide-react';
import { List } from 'lucide-react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import CTAButton from '@/components/CTAButton';
import TicketScanner from '@/components/TicketScanner';
import TicketDashboard from '@/components/TicketDashboard';

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'scan' | 'dashboard'>('home');

  const handleScanTicket = () => {
    console.log('Navigating to scan ticket...');
    setCurrentView('scan');
  };

  const handleViewTickets = () => {
    console.log('Navigating to ticket dashboard...');
    setCurrentView('dashboard');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
  };

  if (currentView === 'scan') {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="px-4 py-8">
          <div className="max-w-screen-xl mx-auto">
            <button
              onClick={handleBackToHome}
              className="mb-6 text-tixapp-teal hover:text-tixapp-teal-dark focus:outline-none focus:ring-2 focus:ring-tixapp-teal focus:ring-offset-2 rounded px-2 py-1"
              aria-label="Back to home"
            >
              ← Back to Home
            </button>
            <TicketScanner />
          </div>
        </main>
      </div>
    );
  }

  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="px-4 py-8">
          <div className="max-w-screen-xl mx-auto">
            <button
              onClick={handleBackToHome}
              className="mb-6 text-tixapp-teal hover:text-tixapp-teal-dark focus:outline-none focus:ring-2 focus:ring-tixapp-teal focus:ring-offset-2 rounded px-2 py-1"
              aria-label="Back to home"
            >
              ← Back to Home
            </button>
            <TicketDashboard />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Main CTAs */}
        <section className="px-4 py-8">
          <div className="max-w-screen-xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="animate-fade-in">
                <CTAButton
                  icon={Camera}
                  title="Scan or Upload Ticket"
                  description="Take a photo or upload your parking ticket to get started"
                  onClick={handleScanTicket}
                  variant="primary"
                />
              </div>
              
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CTAButton
                  icon={List}
                  title="View My Tickets"
                  description="Check the status of your existing ticket appeals"
                  onClick={handleViewTickets}
                  variant="secondary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Additional Information */}
        <section className="px-4 py-8 bg-tixapp-gray/20">
          <div className="max-w-screen-xl mx-auto text-center">
            <h2 className="text-xl font-semibold text-tixapp-navy mb-4">
              How TixApp Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-tixapp-teal rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-lg">1</span>
                </div>
                <h3 className="font-medium text-tixapp-navy">Scan Your Ticket</h3>
                <p className="text-sm text-gray-600">Upload or photograph your parking ticket</p>
              </div>
              
              <div className="space-y-2">
                <div className="w-12 h-12 bg-tixapp-teal rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-lg">2</span>
                </div>
                <h3 className="font-medium text-tixapp-navy">AI Analysis</h3>
                <p className="text-sm text-gray-600">Our AI reviews your case for appeal opportunities</p>
              </div>
              
              <div className="space-y-2">
                <div className="w-12 h-12 bg-tixapp-teal rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-lg">3</span>
                </div>
                <h3 className="font-medium text-tixapp-navy">Submit Appeal</h3>
                <p className="text-sm text-gray-600">We generate and submit your professional appeal</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-tixapp-navy text-white py-6 px-4">
        <div className="max-w-screen-xl mx-auto text-center">
          <p className="text-sm opacity-90">
            © 2024 TixApp. Professional parking ticket appeals powered by AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
