import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import type { Ticket } from '../pages/Dashboard';
import { X, Clock, Trash2, Sparkles, Copy } from 'lucide-react';
import CustomSelect from './CustomSelect';
import { useAuth } from '../context/AuthContext';

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface TicketDetailSheetProps {
  ticketId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const TicketDetailSheet: React.FC<TicketDetailSheetProps> = ({
  ticketId,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isAgent = user?.role === 'agent';
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const isTicketClosed = ticket?.status === 'closed';
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchTicketDetail = async () => {
    if (!ticketId) return;
    try {
      const response = await api.get(`/tickets/${ticketId}`);
      setTicket(response.data);
    } catch (error) {
      console.error('Error fetching ticket detail:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && ticketId) {
      setLoading(true);
      fetchTicketDetail();
      fetchUsers();
    } else {
      setTicket(null);
    }
  }, [isOpen, ticketId]);

  useEffect(() => {
    if (!isOpen || !ticketId || !ticket) return;

    let interval: any = null;
    if (ticket.enrichmentStatus === 'pending' || ticket.enrichmentStatus === 'processing' as any) {
      interval = setInterval(() => {
        fetchTicketDetail();
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, ticketId, ticket?.enrichmentStatus]);

  const handleUpdateField = async (fields: { status?: string; priority?: string; category?: string; assignedToId?: number | null }) => {
    if (!ticketId) return;
    try {
      const response = await api.patch(`/tickets/${ticketId}`, fields);
      setTicket(response.data);
      onUpdate();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticketId) return;
    if (!window.confirm('¿Estás seguro de eliminar este ticket? Esta acción no se puede deshacer.')) {
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/tickets/${ticketId}`);
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error('Error deleting ticket:', error);
      alert(error.response?.data?.error?.message || 'Error al eliminar el ticket');
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container with centered zoom-in animation */}
      <div className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-[#161F30] border border-[#232F48] shadow-2xl shadow-black/80 flex flex-col animate-in zoom-in-95 duration-200 ease-out">
        
        {/* Stub Header */}
        <div className="px-6 pt-6 pb-4 bg-[#161F30] relative shrink-0 overflow-x-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {ticket && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[#0E1422] text-[#00E5FF] border border-[#232F48]">
                  #{ticket.id}
                </span>
              )}
              <span className="text-xs uppercase tracking-widest text-[#94A3B8] font-semibold">
                Ticket Stub Físico
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {ticket && isAdmin && (
                <button
                  onClick={handleDeleteTicket}
                  disabled={deleting}
                  className="inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-semibold bg-[#FF3B5C]/10 text-[#FF3B5C] border border-[#FF3B5C]/30 hover:bg-[#FF3B5C]/20 transition-all disabled:opacity-50"
                  title="Eliminar Ticket"
                >
                  <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  {deleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              )}
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-[#94A3B8] hover:bg-[#0E1422] hover:text-white transition-all border border-transparent hover:border-[#232F48]"
                title="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-3">
            {loading ? (
              <div className="h-7 w-3/4 bg-[#0E1422] animate-pulse rounded-lg" />
            ) : ticket ? (
              <h2 className="text-xl font-bold text-white tracking-tight">{ticket.title}</h2>
            ) : (
              <h2 className="text-xl font-bold text-white">Cargando ticket...</h2>
            )}
          </div>
        </div>

        {/* Troquelado / Perforated Line with Notches */}
        <div className="relative px-6 my-2 shrink-0 overflow-x-hidden">
          {/* Semicircle notches on left and right borders */}
          <div className="absolute -left-3 -top-2 w-6 h-6 rounded-full bg-[#0B0F19] border-r border-[#232F48] z-20 pointer-events-none" />
          <div className="absolute -right-3 -top-2 w-6 h-6 rounded-full bg-[#0B0F19] border-l border-[#232F48] z-20 pointer-events-none" />
          
          <div className="border-t-2 border-dashed border-[#232F48]" />
        </div>

        {/* Ticket Body Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 space-y-5 bg-[#161F30] pr-2">
          {loading ? (
            <div className="space-y-4 animate-pulse pt-4">
              <div className="h-28 rounded-xl bg-[#0E1422]"></div>
              <div className="h-20 rounded-xl bg-[#0E1422]"></div>
              <div className="h-36 rounded-xl bg-[#0E1422]"></div>
            </div>
          ) : !ticket ? (
            <div className="text-center text-[#94A3B8] py-12">No se pudo cargar la información del ticket.</div>
          ) : (
            <div className="space-y-5">
              {/* Panel de Controles / Campos (Grid 2x2) */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[#232F48] bg-[#0E1422] p-4">
                {/* Estado */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                    Estado
                  </label>
                  {isAgent && isTicketClosed ? (
                    <div className="w-full rounded-xl bg-[#161F30] border border-[#232F48] px-3 py-2 text-sm text-[#94A3B8] flex items-center justify-between">
                      <span>Cerrado</span>
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">Bloqueado</span>
                    </div>
                  ) : (
                    <CustomSelect
                      value={ticket.status}
                      onChange={(val) => handleUpdateField({ status: val })}
                      options={
                        isAgent
                          ? [
                              { value: 'open', label: 'Abierto' },
                              { value: 'in_progress', label: 'En Proceso' },
                              { value: 'resolved', label: 'Resuelto' },
                            ]
                          : [
                              { value: 'open', label: 'Abierto' },
                              { value: 'in_progress', label: 'En Proceso' },
                              { value: 'resolved', label: 'Resuelto' },
                              { value: 'closed', label: 'Cerrado' },
                            ]
                      }
                      placeholder="Seleccionar estado"
                    />
                  )}
                </div>

                {/* Prioridad */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                    Prioridad
                  </label>
                  {isAgent ? (
                    <div className="w-full rounded-xl bg-[#161F30] border border-[#232F48] px-3 py-2 text-sm text-white flex items-center justify-between">
                      <span>
                        {ticket.priority === 'low' ? 'Baja' :
                         ticket.priority === 'medium' ? 'Media' :
                         ticket.priority === 'high' ? 'Alta' :
                         ticket.priority === 'urgent' ? 'Urgente' : 'Sin prioridad'}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] uppercase">Solo lectura</span>
                    </div>
                  ) : (
                    <CustomSelect
                      value={ticket.priority || ''}
                      onChange={(val) => handleUpdateField({ priority: val })}
                      options={[
                        { value: 'low', label: 'Baja' },
                        { value: 'medium', label: 'Media' },
                        { value: 'high', label: 'Alta' },
                        { value: 'urgent', label: 'Urgente' },
                      ]}
                      placeholder="Sin prioridad"
                    />
                  )}
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                    Categoría
                  </label>
                  {isAgent ? (
                    <div className="w-full rounded-xl bg-[#161F30] border border-[#232F48] px-3 py-2 text-sm text-white flex items-center justify-between">
                      <span className="capitalize">{ticket.category || 'Sin categoría'}</span>
                      <span className="text-[10px] text-[#94A3B8] uppercase">Solo lectura</span>
                    </div>
                  ) : (
                    <CustomSelect
                      value={ticket.category || ''}
                      onChange={(val) => handleUpdateField({ category: val })}
                      options={[
                        { value: 'billing', label: 'Billing' },
                        { value: 'technical', label: 'Technical' },
                        { value: 'account', label: 'Account' },
                        { value: 'other', label: 'Other' },
                      ]}
                      placeholder="Sin categoría"
                    />
                  )}
                </div>

                {/* Asignado */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                    Asignado
                  </label>
                  {isAgent ? (
                    <div className="w-full rounded-xl bg-[#161F30] border border-[#232F48] px-3 py-2 text-sm text-white flex items-center justify-between">
                      <span>{(ticket as any).assignedTo?.name || 'Sin asignar'}</span>
                      <span className="text-[10px] text-[#94A3B8] uppercase">Solo lectura</span>
                    </div>
                  ) : (
                    <CustomSelect
                      value={(ticket as any).assignedTo?.id ? (ticket as any).assignedTo.id.toString() : ''}
                      onChange={(val) => {
                        const parsed = val ? parseInt(val, 10) : null;
                        handleUpdateField({ assignedToId: parsed });
                      }}
                      options={users.map((u) => ({ value: u.id.toString(), label: u.name }))}
                      placeholder="Sin asignar"
                    />
                  )}
                </div>
              </div>

                {/* Descripción */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                    Descripción
                  </label>
                  <div className="rounded-xl border border-[#232F48] bg-[#0E1422] p-4 text-sm text-[#94A3B8] whitespace-pre-wrap leading-relaxed">
                    {ticket.description}
                  </div>
                </div>

                {/* Etiquetas (IA) si existen */}
                {ticket.tags && ticket.tags.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1.5">
                      Etiquetas
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ticket.tags.map((tag, idx) => (
                        <span key={idx} className="rounded-lg bg-[#0E1422] border border-[#232F48] px-2.5 py-1 text-xs font-medium text-[#00E5FF]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tarjeta de Respuesta Sugerida por IA (n8n) */}
                <div className="rounded-2xl border border-[#C6FF00]/40 bg-[#0E1422] p-5 space-y-4 shadow-lg shadow-[#C6FF00]/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-[#C6FF00]" />
                      <h4 className="text-sm font-semibold text-white">Respuesta Sugerida por IA (n8n)</h4>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${
                      ticket.enrichmentStatus === 'done' ? 'bg-[#C6FF00]/10 text-[#C6FF00] border-[#C6FF00]/30' :
                      ticket.enrichmentStatus === 'pending' || (ticket.enrichmentStatus as string) === 'processing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse' :
                      'bg-[#FF3B5C]/10 text-[#FF3B5C] border-[#FF3B5C]/30'
                    }`}>
                      {ticket.enrichmentStatus === 'done' ? 'Enriquecido' :
                       ticket.enrichmentStatus === 'pending' || (ticket.enrichmentStatus as string) === 'processing' ? 'Procesando IA...' : 'Fallido'}
                    </span>
                  </div>

                  {ticket.enrichmentStatus === 'pending' || (ticket.enrichmentStatus as string) === 'processing' ? (
                    <div className="flex items-center space-x-3 py-3 text-sm text-[#94A3B8]">
                      <Clock className="h-4 w-4 animate-spin text-[#C6FF00]" />
                      <span>Esperando análisis automático de n8n (actualización en tiempo real cada 3s)...</span>
                    </div>
                  ) : ticket.suggestedReply ? (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-[#232F48] bg-[#161F30] p-4 text-sm text-white leading-relaxed">
                        {ticket.suggestedReply}
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(ticket.suggestedReply || '');
                          alert('Respuesta sugerida copiada al portapapeles');
                        }}
                        className="inline-flex items-center rounded-xl bg-[#C6FF00] px-4 py-2 text-xs font-semibold text-[#0B0F19] hover:bg-[#b2e600] transition-all shadow-md"
                      >
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        Copiar Respuesta
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-[#94A3B8]">No hay respuesta sugerida disponible.</p>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailSheet;

