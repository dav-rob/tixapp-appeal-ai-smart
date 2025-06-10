import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import TicketDetails from '@/components/TicketDetails';

const DetailsPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="px-4 py-8">
        <div className="max-w-screen-xl mx-auto">
          <button
            onClick={handleBack}
            className="mb-6 text-tixapp-teal hover:text-tixapp-teal-dark focus:outline-none focus:ring-2 focus:ring-tixapp-teal focus:ring-offset-2 rounded px-2 py-1 flex items-center gap-2"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <TicketDetails />
        </div>
      </main>
    </div>
  );
};

export default DetailsPage;