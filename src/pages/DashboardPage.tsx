import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import TicketDashboard from '@/components/TicketDashboard';

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate('/details');
  };

  const handleUploadNew = () => {
    navigate('/scan');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-8">
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
          <TicketDashboard 
            onViewDetails={handleViewDetails}
            onUploadNew={handleUploadNew}
          />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;