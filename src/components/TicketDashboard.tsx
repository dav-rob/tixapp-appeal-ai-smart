
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TicketDashboard = () => {
  // Mock data for demonstration
  const tickets = [
    {
      id: '1',
      ticketNumber: 'NYC-2024-001234',
      status: 'Under Review',
      amount: '$125.00',
      date: '2024-01-15'
    },
    {
      id: '2',
      ticketNumber: 'NYC-2024-001156',
      status: 'Appeal Submitted',
      amount: '$95.00',
      date: '2024-01-10'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Appeal Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'Won':
        return 'bg-green-100 text-green-800';
      case 'Lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-tixapp-navy mb-6">My Tickets</h2>
      
      {tickets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">No tickets found. Scan your first ticket to get started!</p>
          </CardContent>
        </Card>
      ) : (
        tickets.map((ticket) => (
          <Card key={ticket.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg text-tixapp-navy">
                  {ticket.ticketNumber}
                </CardTitle>
                <Badge className={getStatusColor(ticket.status)}>
                  {ticket.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="font-semibold text-tixapp-navy">{ticket.amount}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold text-tixapp-navy">{ticket.date}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default TicketDashboard;
