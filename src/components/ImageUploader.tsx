import React, { useRef, useState } from 'react';
import {
  Upload,
  Camera,
  Box,
  ArrowLeftRight,
  Sparkles,
  Clipboard,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { SAMPLE_PRESETS } from '../utils/sampleData';

interface ImageUploaderProps {
  realImage: string | null;
  renderImage: string | null;
  onSetRealImage: (dataUrl: string | null) => void;
  onSetRenderImage: (dataUrl: string | null) => void;
  onSwapImages: () => void;
  onStartAnalysis: (notes: string) => void;
  isAnalyzing: boolean;
  onLoadPreset: (presetId: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  realImage,
  renderImage,
  onSetRealImage,
  onSetRenderImage,
  onSwapImages,
  onStartAnalysis,
  isAnalyzing,
  onLoadPreset,
}) => {
  const [contextNotes, setContextNotes] = useState('');
  const [isDraggingReal, setIsDraggingReal] = useState(false);
  const [isDraggingRender, setIsDraggingRender] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const realInputRef = useRef<HTMLInputElement>(null);
  const renderInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isReal: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFile(file, isReal);
  };

  const readFile = (file: File, isReal: boolean) => {
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor selecione um arquivo de imagem válido (PNG, JPEG, WebP, etc.).');
      return;
    }
    setUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (isReal) {
        onSetRealImage(result);
      } else {
        onSetRenderImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent, isReal: boolean) => {
    e.preventDefault();
    if (isReal) setIsDraggingReal(false);
    else setIsDraggingRender(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      readFile(file, isReal);
    }
  };

  const handlePasteClipboard = async (isReal: boolean) => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const file = new File([blob], 'clipboard-image.png', { type });
            readFile(file, isReal);
            return;
          }
        }
      }
      setUploadError('Nenhuma imagem encontrada na área de transferência.');
    } catch {
      setUploadError('Não foi possível acessar a área de transferência. Use o botão de upload.');
    }
  };

  const isReady = Boolean(realImage && renderImage);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
      {/* Title & Guidance */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Comparação & Auditoria de Fidelidade Visual
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Carregue a foto do produto ou ambiente real e o render 3D correspondente. Nossa IA
          especialista em computação gráfica inspecionará silhuetas, chanfros, shaders PBR,
          rugosidade, iluminação e destacará visualmente cada discrepância.
        </p>
      </div>

      {uploadError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Dual Upload Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] items-center gap-4 sm:gap-6">
        {/* Real Image Card */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
              <span className="text-sm font-bold text-slate-200 uppercase tracking-wide">
                1. Imagem Real (Referência Física)
              </span>
            </div>
            {realImage && (
              <button
                type="button"
                onClick={() => onSetRealImage(null)}
                className="text-xs text-slate-400 hover:text-rose-400 transition flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Remover
              </button>
            )}
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingReal(true);
            }}
            onDragLeave={() => setIsDraggingReal(false)}
            onDrop={(e) => handleDrop(e, true)}
            className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-80 sm:h-96 transition overflow-hidden group ${
              isDraggingReal
                ? 'border-emerald-500 bg-emerald-500/10'
                : realImage
                  ? 'border-slate-700 bg-slate-950/60'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800/60'
            }`}
          >
            {realImage ? (
              <div className="relative w-full h-full flex items-center justify-center p-2">
                <img
                  src={realImage}
                  alt="Referência Real"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                />
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-medium text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Foto Real Carregada
                </div>
              </div>
            ) : (
              <div className="p-6 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 transition duration-200">
                  <Camera className="w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  Arraste a foto real aqui ou
                </p>
                <button
                  type="button"
                  onClick={() => realInputRef.current?.click()}
                  className="mt-2.5 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition shadow"
                >
                  Selecionar Imagem do Computador
                </button>
                <button
                  type="button"
                  onClick={() => handlePasteClipboard(true)}
                  className="mt-2 text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1 transition"
                >
                  <Clipboard className="w-3 h-3" /> Colar da Área de Transferência (Ctrl+V)
                </button>
                <p className="mt-3 text-[11px] text-slate-500">
                  Formatos suportados: PNG, JPG, WebP, TIFF
                </p>
              </div>
            )}
            <input
              type="file"
              ref={realInputRef}
              accept="image/*"
              onChange={(e) => handleFileChange(e, true)}
              className="hidden"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center py-2 lg:py-0">
          <button
            type="button"
            onClick={onSwapImages}
            disabled={!realImage && !renderImage}
            title="Inverter Imagens (se tiver colocado o render no lugar da foto real)"
            className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:rotate-180 duration-300"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>
        </div>

        {/* Render 3D Card */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-500/20" />
              <span className="text-sm font-bold text-slate-200 uppercase tracking-wide">
                2. Render 3D (Modelo Computacional)
              </span>
            </div>
            {renderImage && (
              <button
                type="button"
                onClick={() => onSetRenderImage(null)}
                className="text-xs text-slate-400 hover:text-rose-400 transition flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Remover
              </button>
            )}
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingRender(true);
            }}
            onDragLeave={() => setIsDraggingRender(false)}
            onDrop={(e) => handleDrop(e, false)}
            className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-80 sm:h-96 transition overflow-hidden group ${
              isDraggingRender
                ? 'border-blue-500 bg-blue-500/10'
                : renderImage
                  ? 'border-slate-700 bg-slate-950/60'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800/60'
            }`}
          >
            {renderImage ? (
              <div className="relative w-full h-full flex items-center justify-center p-2">
                <img
                  src={renderImage}
                  alt="Render 3D"
                  className="max-w-full max-h-full object-contain rounded-lg shadow-md"
                />
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-md text-[11px] font-medium text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Render 3D Carregado
                </div>
              </div>
            ) : (
              <div className="p-6 text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition duration-200">
                  <Box className="w-7 h-7" />
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  Arraste o render 3D aqui ou
                </p>
                <button
                  type="button"
                  onClick={() => renderInputRef.current?.click()}
                  className="mt-2.5 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition shadow"
                >
                  Selecionar Imagem do Computador
                </button>
                <button
                  type="button"
                  onClick={() => handlePasteClipboard(false)}
                  className="mt-2 text-xs text-slate-400 hover:text-slate-300 flex items-center gap-1 transition"
                >
                  <Clipboard className="w-3 h-3" /> Colar da Área de Transferência (Ctrl+V)
                </button>
                <p className="mt-3 text-[11px] text-slate-500">
                  Blender, Maya, 3ds Max, Cinema 4D, V-Ray, Unreal, etc.
                </p>
              </div>
            )}
            <input
              type="file"
              ref={renderInputRef}
              accept="image/*"
              onChange={(e) => handleFileChange(e, false)}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Preset Quick Loader Buttons */}
      <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Experimente com um par de demonstração:
          </span>
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onLoadPreset(preset.id)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 hover:border-slate-600 transition flex items-center gap-1.5"
            >
              <span>{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Optional Notes Toggle / Input */}
        <div className="w-full sm:w-auto">
          <input
            type="text"
            value={contextNotes}
            onChange={(e) => setContextNotes(e.target.value)}
            placeholder="Notas extras (opcional, ex: foco na textura da madeira)"
            className="w-full sm:w-80 px-3.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Action Button: Start AI Inspection */}
      <div className="mt-8 flex flex-col items-center justify-center">
        <button
          type="button"
          disabled={!isReady || isAnalyzing}
          onClick={() => onStartAnalysis(contextNotes)}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition shadow-xl ${
            isReady && !isAnalyzing
              ? 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:via-purple-500 hover:to-pink-400 text-white shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Realizando Auditoria Visual com IA...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Comparar e Destacar Discrepâncias com IA</span>
            </>
          )}
        </button>

        {!isReady && (
          <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            Carregue ambas as imagens ou clique em um exemplo acima para habilitar a análise.
          </p>
        )}
      </div>
    </div>
  );
};
