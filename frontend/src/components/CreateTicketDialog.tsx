import React, { useState } from 'react';
import api from '../lib/api';
import { X } from 'lucide-react';

interface CreateTicketDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateTicketDialog: React.FC<CreateTicketDialogProps> = ({
  isOpen, onClose, onCreated,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [descError, setDescError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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

    setLoading(true);
    try {
      await api.post('/tickets', { title, description });
      setTitle('');
      setDescription('');
      onCreated();
      onClose();
    } catch (err: any) {
      setGeneralError(err.response?.data?.error?.message || 'Error al crear ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[#232F48] bg-[#0E1422] shadow-2xl overflow-hidden text-white">
        <div className="flex items-center justify-between border-b border-[#232F48] px-6 py-4">
          <h3 className="text-lg font-bold">Crear Nuevo Ticket</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-[#94A3B8] hover:bg-[#161F30] hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              onClick={onClose}
              className="rounded-xl border border-[#232F48] bg-[#161F30] px-4 py-2.5 text-sm font-medium text-[#94A3B8] hover:bg-[#232F48] hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#C6FF00] px-5 py-2.5 text-sm font-bold text-[#0B0F19] hover:bg-[#b0e000] disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Creando...' : 'Crear Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketDialog;


