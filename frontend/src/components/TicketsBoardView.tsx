import React from 'react';
import type { Ticket } from '../pages/Dashboard';
import TicketCard from './TicketCard';
import { Inbox } from 'lucide-react';

interface TicketsBoardViewProps {
  tickets: Ticket[];
  onTicketClick: (ticketId: number) => void;
  onStatusChange: (ticketId: number, newStatus: string) => void;
}

export const TicketsBoardView: React.FC<TicketsBoardViewProps> = ({
  tickets,
  onTicketClick,
  onStatusChange,
}) => {
  const columns = [
    { id: 'open', title: 'Abierto', statusKey: 'open' },
    { id: 'in_progress', title: 'En Proceso', statusKey: 'in_progress' },
    { id: 'resolved', title: 'Resuelto', statusKey: 'resolved' },
    { id: 'closed', title: 'Cerrado', statusKey: 'closed' },
  ];

  const handleDragStart = (e: React.DragEvent, ticketId: number) => {
    e.dataTransfer.setData('text/plain', ticketId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const ticketIdStr = e.dataTransfer.getData('text/plain');
    if (!ticketIdStr) return;
    const ticketId = parseInt(ticketIdStr, 10);
    if (isNaN(ticketId)) return;

    const ticket = tickets.find((t) => t.id === ticketId);
    if (ticket && ticket.status !== targetStatus) {
      onStatusChange(ticketId, targetStatus);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full min-h-[600px]">
      {columns.map((col) => {
        const columnTickets = tickets.filter((t) => t.status === col.statusKey);

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.statusKey)}
            className="flex flex-col rounded-2xl border border-[#232F48] bg-[#0E1422] p-4 shadow-sm"
          >
            {/* Encabezado de la Columna */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#232F48]">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white">{col.title}</h3>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#161F30] border border-[#232F48] text-xs font-bold text-[#C6FF00]">
                  {columnTickets.length}
                </span>
              </div>
            </div>

            {/* Lista de tarjetas */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {columnTickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center rounded-xl border border-dashed border-[#232F48] p-4">
                  <Inbox className="h-8 w-8 text-[#94A3B8] mb-2" />
                  <p className="text-xs text-[#94A3B8]">No hay tickets</p>
                </div>
              ) : (
                columnTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onClick={() => onTicketClick(ticket.id)}
                    onDragStart={handleDragStart}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TicketsBoardView;
