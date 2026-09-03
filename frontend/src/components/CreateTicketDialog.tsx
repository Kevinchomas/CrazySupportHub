import React, { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { X, Sparkles, Check, AlertTriangle, Loader2 } from 'lucide-react';
import type { Ticket } from '../pages/Dashboard';

interface CreateTicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newTicket: Ticket) => void;
}

type DialogStep = 'form' | 'waiting' | 'success' | 'error';

export const CreateTicketDialog: React.FC<CreateTicketDialogProps> = ({
  isOpen, onClose, onCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descError, setDescError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [step, setStep] = useState<DialogStep>('form');
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const pollIntervalRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const currentTicketIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setTitleError('');
      setDescError('');
      setGeneralError('');
      setStep('form');
      setCreatedTicket(null);
      setErrorMessage('');
      setElapsedSeconds(0);
      currentTicketIdRef.current = null;
    } else {
      cleanupIntervals();
    }
  }, [isOpen]);

  const cleanupIntervals = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupIntervals();
    };
  }, []);

  if (!isOpen) return null;

  const handleCancelOrClose = () => {
    cleanupIntervals();
    onClose();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTitleError('');
    setDescError('');
    setGeneralError('');

    let hasError = false;
    if (!title.trim()) {
      setTitleError('El título es obligatorio.');
      hasError = true;
    }
    if (!description.trim()) {
      setDescError('La descripción es obligatoria.');
      hasError = true;
    }
    if (hasError) return;

    setStep('waiting');
    setElapsedSeconds(0);

    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        if (prev >= 11) {
          handleTimeoutOrFailure('Tiempo de espera agotado (12s) sin respuesta de n8n.');
          return 12;
        }
        return prev + 1;
      });
    }, 1000);

    try {
      const response = await api.post('/tickets', { title, description });
      const ticket: Ticket = response.data;
      currentTicketIdRef.current = ticket.id;

      if (ticket.enrichmentStatus === 'done') {
        cleanupIntervals();
        setCreatedTicket(ticket);
        setStep('success');
        onCreated(ticket);
        return;
      }

      if (ticket.enrichmentStatus === 'failed') {
        await handleTimeoutOrFailure('No se pudo enriquecer el ticket mediante IA (fallo en n8n).');
        return;
      }

      pollIntervalRef.current = setInterval(async () => {
        if (!currentTicketIdRef.current) return;
        try {
          const res = await api.get(`/tickets/${currentTicketIdRef.current}`);
          const polledTicket: Ticket = res.data;

          if (polledTicket.enrichmentStatus === 'done') {
            cleanupIntervals();
            setCreatedTicket(polledTicket);
            setStep('success');
            onCreated(polledTicket);
          } else if (polledTicket.enrichmentStatus === 'failed') {
            await handleTimeoutOrFailure('No se pudo enriquecer el ticket mediante IA. La creación ha sido anulada.');
          }
        } catch (pollErr) {
          console.error('Error polling ticket enrichment:', pollErr);
        }
      }, 1000);

    } catch (err: any) {
      cleanupIntervals();
      const msg = err.response?.data?.error?.message || 'Error al crear ticket';
      setErrorMessage(msg);
      setStep('error');
    }
  };

  const handleTimeoutOrFailure = async (reason: string) => {
    cleanupIntervals();
    const ticketId = currentTicketIdRef.current;
    if (ticketId) {
      try {
        await api.delete(`/tickets/${ticketId}`);
      } catch (delErr) {
        console.error('Failed to rollback/delete incomplete ticket:', delErr);
      }
      currentTicketIdRef.current = null;
    }
    setErrorMessage(reason);
    setStep('error');
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl border border-[#232F48] bg-[#0E1422] shadow-2xl overflow-hidden text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#232F48] px-6 py-4">
          <div className="flex items-center space-x-2">
            {step === 'waiting' && <Sparkles className="h-5 w-5 text-[#C6FF00] animate-pulse" />}
            {step === 'success' && <Check className="h-5 w-5 text-[#C6FF00]" />}
            {step === 'error' && <AlertTriangle className="h-5 w-5 text-[#FF3B5C]" />}
            <h3 className="text-lg font-bold">
              {step === 'form' && 'Crear Nuevo Ticket'}
              {step === 'waiting' && 'Analizando con IA'}
              {step === 'success' && 'Ticket Creado Exitosamente'}
              {step === 'error' && 'Error en Creación'}
            </h3>
          </div>
          {step !== 'waiting' && (
            <button onClick={handleCancelOrClose} className="rounded-lg p-1 text-[#94A3B8] hover:bg-[#161F30] hover:text-white">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Step 1: Form */}
        {step === 'form' && (
          <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
            {generalError && (
              <div className="rounded-lg border border-[#FF3B5C]/30 bg-[#FF3B5C]/10 p-3 text-sm text-[#FF3B5C]">
                {generalError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Problema al procesar factura"
                className="w-full rounded-xl border border-[#232F48] bg-[#161F30] px-3.5 py-2.5 text-sm text-white placeholder-[#94A3B8] focus:border-[#C6FF00] focus:outline-none"
              />
              {titleError && <p className="mt-1 text-xs text-[#FF3B5C]">{titleError}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-1">Descripción</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe detalladamente tu inconveniente..."
                className="w-full rounded-xl border border-[#232F48] bg-[#161F30] px-3.5 py-2.5 text-sm text-white placeholder-[#94A3B8] focus:border-[#C6FF00] focus:outline-none"
              />
              {descError && <p className="mt-1 text-xs text-[#FF3B5C]">{descError}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-[#232F48]">
              <button
                type="button"
                onClick={handleCancelOrClose}
                className="rounded-xl border border-[#232F48] bg-[#161F30] px-4 py-2.5 text-sm font-medium text-[#94A3B8] hover:bg-[#232F48] hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#C6FF00] px-5 py-2.5 text-sm font-bold text-[#0B0F19] hover:bg-[#b0e000] shadow-sm transition-all"
              >
                Crear Ticket
              </button>
            </div>
          </form>
        )}
        {/* Step 2: Waiting / Polling state */}
        {step === 'waiting' && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-20 w-20 rounded-full bg-[#C6FF00]/10 animate-ping"></div>
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#161F30] border border-[#C6FF00]/40 text-[#C6FF00] shadow-lg shadow-[#C6FF00]/10">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            </div>

            <div className="space-y-2 max-w-sm">
              <h4 className="text-base font-bold text-white">Analizando ticket con IA (n8n)... Espere un momento.</h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                El motor de automatización está clasificando la prioridad, categoría y generando una respuesta sugerida.
              </p>
            </div>

            <div className="w-full bg-[#161F30] rounded-full h-2 border border-[#232F48] overflow-hidden">
              <div
                className="bg-[#C6FF00] h-full transition-all duration-1000 ease-linear"
                style={{ width: `${Math.min(100, (elapsedSeconds / 12) * 100)}%` }}
              ></div>
            </div>
            <span className="text-xs font-mono text-[#94A3B8]">
              {elapsedSeconds}s / 12s máx
            </span>
          </div>
        )}

        {/* Step 3: Success Confirmation Modal */}
        {step === 'success' && createdTicket && (
          <div className="p-6 space-y-6">
            <div className="rounded-2xl border border-[#C6FF00]/40 bg-[#C6FF00]/5 p-5 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#C6FF00]/20 text-[#C6FF00]">
                <Check className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-white">
                ¡Ticket #{createdTicket.id} creado y enriquecido exitosamente por la IA!
              </h4>
              <p className="text-xs text-[#94A3B8]">
                Clasificado como <span className="text-[#C6FF00] font-semibold">{createdTicket.category || 'general'}</span> con prioridad <span className="text-[#C6FF00] font-semibold">{createdTicket.priority || 'medium'}</span>.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleCancelOrClose}
                className="w-full rounded-xl bg-[#C6FF00] py-3 text-sm font-bold text-[#0B0F19] hover:bg-[#b0e000] shadow-md transition-all"
              >
                Ver Ticket en el Kanban
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Error / Failure / Timeout Modal */}
        {step === 'error' && (
          <div className="p-6 space-y-6">
            <div className="rounded-2xl border border-[#FF3B5C]/40 bg-[#FF3B5C]/10 p-5 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FF3B5C]/20 text-[#FF3B5C]">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h4 className="text-base font-bold text-white">
                No se pudo enriquecer el ticket mediante IA.
              </h4>
              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {errorMessage || 'La creación ha sido anulada.'} Inténtalo de nuevo.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCancelOrClose}
                className="w-full rounded-xl border border-[#232F48] bg-[#161F30] py-3 text-sm font-semibold text-[#94A3B8] hover:bg-[#232F48] hover:text-white transition-all"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="w-full rounded-xl bg-[#C6FF00] py-3 text-sm font-bold text-[#0B0F19] hover:bg-[#b0e000] shadow-md transition-all"
              >
                Intentar de Nuevo
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );

};

export default CreateTicketDialog;


