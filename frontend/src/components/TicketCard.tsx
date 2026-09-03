import React from 'react';
import type { Ticket } from '../pages/Dashboard';
import { Sparkles } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, ticketId: number) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onClick, onDragStart }) => {
  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] md:text-[10px] font-bold bg-[#FF3B5C]/20 text-[#FF3B5C] border border-[#FF3B5C]/30">Urgente</span>;
      case 'high':
        return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] md:text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Alta</span>;
      case 'medium':
        return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] md:text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Media</span>;
      case 'low':
        return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] md:text-[10px] font-bold bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">Baja</span>;
      default:
        return <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] md:text-[10px] font-bold bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">Normal</span>;
    }
  };

  const getCategoryLabel = (cat?: string) => {
    switch (cat) {
      case 'technical': return 'Técnica';
      case 'billing': return 'Facturación';
      case 'account': return 'Cuenta';
      case 'other': return 'Otro';
      default: return cat || 'General';
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, ticket.id)}
      onClick={onClick}
      className="group relative flex flex-col justify-between rounded-xl border border-[#232F48] bg-[#161F30] p-3 md:p-3.5 shadow-sm transition-all hover:border-[#C6FF00]/50 hover:shadow-md cursor-grab active:cursor-grabbing"
    >
      {/* Header de la tarjeta */}
      <div className="flex items-center justify-between mb-2">
        {getPriorityBadge(ticket.priority)}
        <span className="text-[11px] md:text-xs font-mono font-medium text-[#94A3B8]">#{ticket.id}</span>
      </div>

      {/* Título (máximo 2 líneas, truncado) */}
      <h3 className="text-xs md:text-sm font-semibold text-white line-clamp-2 mb-2.5 leading-snug">
        {ticket.title}
      </h3>

      {/* Categoría e IA */}
      <div className="flex items-center justify-between mb-3 text-xs gap-1">
        <span className="rounded-md bg-[#0B0F19] px-2 py-0.5 text-[10px] md:text-xs text-[#94A3B8] border border-[#232F48] truncate max-w-[110px]">
          {getCategoryLabel(ticket.category)}
        </span>

        {ticket.enrichmentStatus === 'done' && (
          <span className="inline-flex items-center rounded-md bg-[#C6FF00]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#C6FF00] border border-[#C6FF00]/30 shadow-sm shrink-0" title="IA Enriquecida">
            <Sparkles className="mr-1 h-3 w-3 text-[#C6FF00]" />
            IA Enriquecida
          </span>
        )}
      </div>

      {/* Footer: Creador/Asignado y Fecha */}
      <div className="flex flex-col space-y-2 border-t border-[#232F48] pt-2.5 mt-auto">
        <div className="flex items-center justify-between text-xs gap-1">
          <div className="flex items-center space-x-1 min-w-0" title={`Creado por: ${ticket.createdBy?.name || 'Cliente'}`}>
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0B0F19] border border-[#232F48] text-[#94A3B8] font-bold text-[9px]">
              {ticket.createdBy?.name ? ticket.createdBy.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <span className="text-[10px] md:text-[11px] text-[#94A3B8] truncate">{ticket.createdBy?.name || 'Cliente'}</span>
          </div>

          <div className="flex items-center space-x-1 min-w-0">
            {ticket.assignedTo ? (
              <div className="inline-flex items-center space-x-1 bg-[#C6FF00]/10 border border-[#C6FF00]/30 rounded px-1 py-0.5 min-w-0" title={`Asignado a: ${ticket.assignedTo.name}`}>
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0B0F19] text-[#C6FF00] font-bold text-[8px]">
                  {ticket.assignedTo.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-[10px] md:text-[11px] font-medium text-[#C6FF00] truncate">{ticket.assignedTo.name}</span>
              </div>
            ) : (
              <span className="text-[10px] md:text-[11px] text-[#94A3B8] italic bg-zinc-800/50 px-1.5 py-0.5 rounded border border-zinc-700/50 truncate">
                Sin asignar
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end">
          <span className="text-[10px] font-mono text-[#94A3B8]">
            {new Date(ticket.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
