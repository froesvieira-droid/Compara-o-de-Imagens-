import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';

interface ManualAnnotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  coordinates: { x: number; y: number } | null;
}

export const ManualAnnotationModal: React.FC<ManualAnnotationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  coordinates,
}) => {
  const [note, setNote] = useState('');

  if (!isOpen || !coordinates) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    onSave(note.trim());
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-white">Adicionar Ponto de Auditoria Manual</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observação ou Instrução para o Artista 3D:
            </label>
            <textarea
              required
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Verificar espessura do chanfro nesta aresta superior; está visualmente mais espesso no render..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-lg shadow-amber-500/20"
            >
              Fixar Anotação
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
