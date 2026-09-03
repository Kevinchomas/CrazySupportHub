import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import AppLayout from '../components/AppLayout';
import TicketsBoardView from '../components/TicketsBoardView';
import MetricsDashboardView from '../components/MetricsDashboardView';
import TicketDetailSheet from '../components/TicketDetailSheet';
import CreateTicketDialog from '../components/CreateTicketDialog';

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'billing' | 'technical' | 'account' | 'other';
  tags: string[];
  suggestedReply?: string;
  enrichmentStatus: 'pending' | 'processing' | 'done' | 'failed';
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  assignedTo?: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
}

export const Dashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [page] = useState<number>(1);
  const [limit] = useState<number>(100);

  const [activeTab, setActiveTab] = useState<'kanban' | 'metrics'>('kanban');

  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (search) params.search = search;

      const response = await api.get('/tickets', { params });
      setTickets(response.data.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter, priorityFilter, categoryFilter, search]);

  const handleStatusChange = async (ticketId: number, newStatus: string) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus as any } : t))
    );

    try {
      await api.patch(`/tickets/${ticketId}`, { status: newStatus });
      fetchTickets();
    } catch (error) {
      console.error('Error updating status:', error);
      fetchTickets();
    }
  };

  return (
    <AppLayout
      searchQuery={search}
      onSearchChange={setSearch}
      categoryFilter={categoryFilter}
      onCategoryChange={setCategoryFilter}
      priorityFilter={priorityFilter}
      onPriorityChange={setPriorityFilter}
      onOpenCreate={() => setIsCreateOpen(true)}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {loading && tickets.length === 0 ? (
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C6FF00] border-t-transparent"></div>
        </div>
      ) : activeTab === 'kanban' ? (
        <TicketsBoardView
          tickets={tickets}
          onTicketClick={(id) => {
            setSelectedTicketId(id);
            setIsSheetOpen(true);
          }}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <MetricsDashboardView tickets={tickets} />
      )}

      <TicketDetailSheet
        ticketId={selectedTicketId}
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setSelectedTicketId(null);
        }}
        onUpdate={fetchTickets}
      />

      <CreateTicketDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={(newTicket) => {
          setTickets((prev) => [newTicket, ...prev]);
        }}
      />
    </AppLayout>
  );
};

export default Dashboard;

