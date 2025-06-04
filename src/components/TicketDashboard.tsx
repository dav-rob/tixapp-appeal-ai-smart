
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, Plus } from 'lucide-react';

interface TicketDashboardProps {
  onViewDetails?: () => void;
  onUploadNew?: () => void;
}

const TicketDashboard = ({ onViewDetails, onUploadNew }: TicketDashboardProps) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  // Mock data for demonstration - expanded with more statuses
  const allTickets = [
    {
      id: '1',
      pcnRef: 'PCN123456789',
      ticketNumber: 'NYC-2024-001234',
      status: 'Pending',
      decision: 'Under Review',
      amount: '$125.00',
      dateIssued: '2024-01-15',
      location: 'Baker Street'
    },
    {
      id: '2',
      pcnRef: 'PCN987654321',
      ticketNumber: 'NYC-2024-001156',
      status: 'Advised',
      decision: 'Challenge Recommended',
      amount: '$95.00',
      dateIssued: '2024-01-10',
      location: 'Oxford Street'
    },
    {
      id: '3',
      pcnRef: 'PCN555666777',
      ticketNumber: 'NYC-2024-000998',
      status: 'Closed',
      decision: 'Appeal Won',
      amount: '$75.00',
      dateIssued: '2024-01-05',
      location: 'High Street'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Advised':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Closed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter and sort tickets
  const filteredTickets = allTickets
    .filter(ticket => statusFilter === 'all' || ticket.status === statusFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime();
        case 'date-asc':
          return new Date(a.dateIssued).getTime() - new Date(b.dateIssued).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-tixapp-navy">My Tickets</h2>
        
        {/* Filter and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Advised">Advised</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="status">By Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600 mb-4">
              {statusFilter === 'all' 
                ? "No tickets found. Scan your first ticket to get started!" 
                : `No tickets found with status "${statusFilter}".`
              }
            </p>
            <Button 
              onClick={onUploadNew}
              className="bg-tixapp-teal hover:bg-tixapp-teal-light text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload New Ticket
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 font-medium text-gray-700">PCN Reference</th>
                        <th className="text-left p-4 font-medium text-gray-700">Date Issued</th>
                        <th className="text-left p-4 font-medium text-gray-700">Status</th>
                        <th className="text-left p-4 font-medium text-gray-700">Decision</th>
                        <th className="text-left p-4 font-medium text-gray-700">Amount</th>
                        <th className="text-right p-4 font-medium text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTickets.map((ticket) => (
                        <tr 
                          key={ticket.id} 
                          className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={onViewDetails}
                        >
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-tixapp-navy">{ticket.pcnRef}</p>
                              <p className="text-sm text-gray-600">{ticket.location}</p>
                            </div>
                          </td>
                          <td className="p-4 text-gray-700">{ticket.dateIssued}</td>
                          <td className="p-4">
                            <Badge className={getStatusColor(ticket.status)}>
                              {ticket.status}
                            </Badge>
                          </td>
                          <td className="p-4 text-gray-700">{ticket.decision}</td>
                          <td className="p-4 font-semibold text-tixapp-navy">{ticket.amount}</td>
                          <td className="p-4 text-right">
                            <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {filteredTickets.map((ticket) => (
              <Card 
                key={ticket.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={onViewDetails}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-tixapp-navy">{ticket.pcnRef}</h3>
                      <p className="text-sm text-gray-600">{ticket.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Date Issued</p>
                      <p className="font-medium">{ticket.dateIssued}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Amount</p>
                      <p className="font-semibold text-tixapp-navy">{ticket.amount}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600">Decision</p>
                      <p className="font-medium">{ticket.decision}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Fixed Footer Button for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t md:hidden">
        <Button 
          onClick={onUploadNew}
          className="w-full bg-tixapp-teal hover:bg-tixapp-teal-light text-white h-12"
        >
          <Plus className="h-5 w-5 mr-2" />
          Upload New Ticket
        </Button>
      </div>

      {/* Desktop Upload Button */}
      <div className="hidden md:block text-center">
        <Button 
          onClick={onUploadNew}
          className="bg-tixapp-teal hover:bg-tixapp-teal-light text-white px-8"
        >
          <Plus className="h-4 w-4 mr-2" />
          Upload New Ticket
        </Button>
      </div>
    </div>
  );
};

export default TicketDashboard;
