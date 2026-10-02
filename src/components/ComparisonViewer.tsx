import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Columns2,
  Flame,
  Columns,
  Layers,
  Zap,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sliders,
  Eye,
  EyeOff,
  MapPin,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Search,
  Crosshair,
  Grid,
} from 'lucide-react';
import {
  ComparisonMode,
  Discrepancy,
  HeatmapStyle,
  ImageAlignment,
  ManualAnnotation,
} from '../types';
import { generatePixelDiff, DiffResult } from '../utils/diffEngine';

interface ComparisonViewerProps {
  realImage: string;
  renderImage: string;
  discrepancies: Discrepancy[];
  selectedDiscrepancyId: string | null;
  onSelectDiscrepancy: (id: string | null) => void;
  manualAnnotations: ManualAnnotation[];
  onAddAnnotation: (x: number, y: number) => void;
  onRemoveAnnotation: (id: string) => void;
}

export const ComparisonViewer: React.FC<ComparisonViewerProps> = ({
  realImage,
  renderImage,
  discrepancies,
  selectedDiscrepancyId,
  onSelectDiscrepancy,
  manualAnnotations,
  onAddAnnotation,
  onRemoveAnnotation,
}) => {
  // Mode selection
  const [mode, setMode] = useState<ComparisonMode>('split');

  // Split Screen Slider
  const [splitPos, setSplitPos] = useState<number>(50); // 0 to 100%
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Zoom and Pan
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Discrepancy Highlights visibility
  const [showAiBoxes, setShowAiBoxes] = useState<boolean>(true);
  const [showManualPins, setShowManualPins] = useState<boolean>(true);
  const [isAddingPin, setIsAddingPin] = useState<boolean>(false);

  // Heatmap & Pixel Diff settings
  const [heatmapStyle, setHeatmapStyle] = useState<HeatmapStyle>('turbo_heatmap');
  const [diffThreshold, setDiffThreshold] = useState<number>(18);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [isGeneratingDiff, setIsGeneratingDiff] = useState<boolean>(false);

  // Overlay Mode settings
  const [overlayOpacity, setOverlayOpacity] = useState<number>(50); // 0 = 100% real, 100 = 100% 3D
  const [blendMode, setBlendMode] = useState<string>('difference');

  // Blink Comparator settings
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [blinkSpeed, setBlinkSpeed] = useState<number>(3); // Hz (cycles per second)
  const [currentBlinkFrame, setCurrentBlinkFrame] = useState<'real' | 'render'>('real');

  // Alignment settings
  const [showAlignPanel, setShowAlignPanel] = useState<boolean>(false);
  const [alignment, setAlignment] = useState<ImageAlignment>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
  });

  // Crosshair coordinates for synchronized side-by-side
  const [crosshairPos, setCrosshairPos] = useState<{ x: number; y: number } | null>(null);

  // Magnifying Glass (Loupe) settings & state
  const [isLoupeActive, setIsLoupeActive] = useState<boolean>(false);
  const [loupeZoom, setLoupeZoom] = useState<number>(3); // 2x, 3x, 4x, 8x
  const [loupeSize, setLoupeSize] = useState<number>(220); // 160, 220, 280 px
  const [loupeTarget, setLoupeTarget] = useState<'split' | 'real' | 'render'>('split');
  const [showPixelGrid, setShowPixelGrid] = useState<boolean>(true);
  const [loupeState, setLoupeState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    relX: number;
    relY: number;
    w: number;
    h: number;
    side?: 'left' | 'right' | 'main';
  }>({
    visible: false,
    x: 0,
    y: 0,
    relX: 0,
    relY: 0,
    w: 800,
    h: 800,
    side: 'main',
  });

  const handleLoupeMove = (e: React.MouseEvent<HTMLDivElement>, side: 'main' | 'left' | 'right' = 'main') => {
    if (!isLoupeActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    setLoupeState({
      visible: true,
      x: relX,
      y: relY,
      relX,
      relY,
      w: rect.width,
      h: rect.height,
      side,
    });
  };

  const handleLoupeLeave = () => {
    if (isLoupeActive) {
      setLoupeState((prev) => ({ ...prev, visible: false }));
    }
  };

  const renderLoupeLens = (
    content: React.ReactNode,
    label?: string,
    borderColor = 'border-slate-100'
  ) => {
    if (!isLoupeActive || !loupeState.visible) return null;

    return (
      <div
        className={`absolute pointer-events-none rounded-full overflow-hidden shadow-[0_0_35px_rgba(0,0,0,0.95)] z-40 border-4 ${borderColor} ring-2 ring-indigo-500/80`}
        style={{
          width: `${loupeSize}px`,
          height: `${loupeSize}px`,
          left: `${loupeState.x - loupeSize / 2}px`,
          top: `${loupeState.y - loupeSize / 2}px`,
          backgroundColor: '#090d16',
        }}
      >
        {/* Inner Zoomed Viewport */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: `${loupeState.w}px`,
            height: `${loupeState.h}px`,
            left: `${-loupeState.relX * loupeZoom + loupeSize / 2}px`,
            top: `${-loupeState.relY * loupeZoom + loupeSize / 2}px`,
            transform: `scale(${loupeZoom})`,
            transformOrigin: '0 0',
            imageRendering: loupeZoom >= 4 || showPixelGrid ? 'pixelated' : 'auto',
          }}
        >
          {content}
        </div>

        {/* Pixel Grid lines overlay for ultra-crisp pixel inspection */}
        {showPixelGrid && loupeZoom >= 4 && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)',
              backgroundSize: `${loupeZoom * 4}px ${loupeZoom * 4}px`,
            }}
          />
        )}

        {/* Precision Crosshair */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-full h-px bg-cyan-400/40" />
          <div className="h-full w-px bg-cyan-400/40 absolute" />
          <div className="w-3.5 h-3.5 border border-cyan-400/80 rounded-sm absolute shadow-[0_0_8px_rgba(34,211,238,0.7)]" />
          <div className="w-1 h-1 bg-cyan-300 rounded-full absolute" />
        </div>

        {/* Specular glass reflection overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-white/20 rounded-full" />

        {/* HUD readout pill */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur px-2.5 py-0.5 rounded-full border border-slate-700 text-[10px] font-mono text-cyan-300 shadow-xl whitespace-nowrap flex items-center gap-1.5 pointer-events-none z-10">
          <span className="font-bold text-amber-400">{loupeZoom}x</span>
          <span className="text-slate-500">|</span>
          {label && <span className="font-semibold text-slate-300">{label} |</span>}
          <span>
            X:{Math.round(loupeState.relX)} Y:{Math.round(loupeState.relY)}
          </span>
        </div>
      </div>
    );
  };

  // Handle Split Drag
  const handleSplitMove = useCallback(
    (clientX: number) => {
      if (!splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
      const pos = ((clientX - rect.left) / rect.width) * 100;
      setSplitPos(Math.max(0, Math.min(100, pos)));
    },
    []
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingSplit) {
        handleSplitMove(e.clientX);
      }
      if (isPanning) {
        setPan({
          x: e.clientX - panStartRef.current.x,
          y: e.clientY - panStartRef.current.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingSplit(false);
      setIsPanning(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplit, isPanning, handleSplitMove]);

  // Compute pixel diff when entering heatmap mode or changing parameters
  useEffect(() => {
    if (mode === 'heatmap') {
      let isCurrent = true;
      setIsGeneratingDiff(true);
      generatePixelDiff(realImage, renderImage, heatmapStyle, diffThreshold, alignment)
        .then((res) => {
          if (isCurrent) {
            setDiffResult(res);
            setIsGeneratingDiff(false);
          }
        })
        .catch((err) => {
          console.error('Diff calculation error:', err);
          if (isCurrent) setIsGeneratingDiff(false);
        });
      return () => {
        isCurrent = false;
      };
    }
  }, [mode, realImage, renderImage, heatmapStyle, diffThreshold, alignment]);

  // Blink Comparator Interval
  useEffect(() => {
    if (mode !== 'blink' || !isBlinking) return;
    const intervalMs = 1000 / blinkSpeed;
    const timer = setInterval(() => {
      setCurrentBlinkFrame((prev) => (prev === 'real' ? 'render' : 'real'));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [mode, isBlinking, blinkSpeed]);

  // Handle Viewport Click for Pin Annotation
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingPin) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onAddAnnotation(Number(x.toFixed(1)), Number(y.toFixed(1)));
    setIsAddingPin(false);
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => {
      const next = Math.max(0.8, Math.min(4, Number((prev + delta).toFixed(1))));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSplitPos(50);
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Toolbar: Mode Switcher & Tools */}
      <div className="p-3 sm:p-4 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setMode('split')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
              mode === 'split'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Columns2 className="w-3.5 h-3.5" />
            <span>Cortina Dividida</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('heatmap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
              mode === 'heatmap'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Mapa de Calor (Diff)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('side_by_side')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
              mode === 'side_by_side'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Lado a Lado</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('overlay')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
              mode === 'overlay'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Sobreposição & Mistura</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('blink');
              setIsBlinking(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
              mode === 'blink'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            <span>Piscar (Blink)</span>
          </button>
        </div>

        {/* Viewport Controls: Zoom, Pan, Highlights, Pins */}
        <div className="flex items-center gap-2">
          {/* Toggle AI Boxes */}
          {discrepancies.length > 0 && (
            <button
              type="button"
              onClick={() => setShowAiBoxes((v) => !v)}
              title={showAiBoxes ? 'Ocultar marcações de discrepâncias' : 'Mostrar marcações de discrepâncias'}
              className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
                showAiBoxes
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
            >
              {showAiBoxes ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Destaques IA ({discrepancies.length})</span>
            </button>
          )}

          {/* Add Manual Annotation Pin */}
          <button
            type="button"
            onClick={() => setIsAddingPin((v) => !v)}
            title="Adicionar ponto de anotação manual"
            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
              isAddingPin
                ? 'bg-amber-500 text-slate-900 border-amber-400 font-bold'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isAddingPin ? 'Clique na Imagem' : '+ Pino'}</span>
          </button>

          {/* Magnifying Glass (Loupe) Toggle Button */}
          <button
            type="button"
            onClick={() => setIsLoupeActive((v) => !v)}
            title={isLoupeActive ? 'Desativar Lupa' : 'Ativar Lupa de Pixels (Pixel Zoom / Magnifier)'}
            className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
              isLoupeActive
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lupa {isLoupeActive ? `${loupeZoom}x` : ''}</span>
          </button>

          {/* Alignment calibration tool toggle */}
          <button
            type="button"
            onClick={() => setShowAlignPanel((v) => !v)}
            title="Calibrar alinhamento, escala e rotação da imagem 3D"
            className={`p-1.5 rounded-lg border transition ${
              showAlignPanel
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => handleZoom(-0.25)}
              disabled={zoom <= 0.8}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1.5 text-slate-300 min-w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => handleZoom(0.25)}
              disabled={zoom >= 4}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={resetView}
              className="p-1 rounded text-slate-400 hover:text-white ml-0.5 border-l border-slate-800 transition"
              title="Redefinir Visualização (100%)"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Loupe Settings Sub-bar */}
      {isLoupeActive && (
        <div className="px-4 py-2 bg-amber-950/20 border-b border-amber-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5" /> Lupa de Inspeção de Pixels:
            </span>
            <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-700">
              {[2, 3, 4, 8].map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setLoupeZoom(z)}
                  className={`px-2 py-0.5 rounded font-mono font-bold transition ${
                    loupeZoom === z
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {z}x
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-700">
              {[
                { size: 160, label: '160px' },
                { size: 220, label: '220px' },
                { size: 280, label: '280px' },
              ].map((s) => (
                <button
                  key={s.size}
                  type="button"
                  onClick={() => setLoupeSize(s.size)}
                  className={`px-2 py-0.5 rounded transition ${
                    loupeSize === s.size
                      ? 'bg-slate-700 text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {mode === 'split' && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Na Lente:</span>
                <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-700">
                  {[
                    { id: 'split', label: 'Cortina' },
                    { id: 'real', label: 'Foto Real' },
                    { id: 'render', label: 'Render 3D' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setLoupeTarget(t.id as any)}
                      className={`px-2 py-0.5 rounded transition ${
                        loupeTarget === t.id
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowPixelGrid((v) => !v)}
              className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition ${
                showPixelGrid
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Alternar grade de sub-pixels da lupa"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Grade Pixel</span>
            </button>

            <span className="text-amber-300/80 text-[11px] hidden lg:inline">
              Passe o mouse sobre as imagens para ampliar em tempo real
            </span>
          </div>
        </div>
      )}

      {/* Sub-toolbar for Specific Modes */}
      {mode === 'heatmap' && (
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">Estilo do Mapa:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setHeatmapStyle('turbo_heatmap')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  heatmapStyle === 'turbo_heatmap'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Gradiente Térmico
              </button>
              <button
                type="button"
                onClick={() => setHeatmapStyle('neon_mask')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  heatmapStyle === 'neon_mask'
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Máscara Neon
              </button>
              <button
                type="button"
                onClick={() => setHeatmapStyle('amplified_diff')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  heatmapStyle === 'amplified_diff'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Diff Amplificado (3.5x)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Threshold Slider */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Sensibilidade:</span>
              <input
                type="range"
                min="5"
                max="60"
                value={diffThreshold}
                onChange={(e) => setDiffThreshold(Number(e.target.value))}
                className="w-24 accent-indigo-500"
              />
              <span className="font-mono text-slate-300">{diffThreshold}</span>
            </div>

            {/* Diff Stats Badge */}
            {diffResult && (
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">
                <span className="text-slate-400">Área Divergente:</span>
                <span
                  className={`font-bold ${
                    diffResult.diffPercentage > 15
                      ? 'text-rose-400'
                      : diffResult.diffPercentage > 5
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                  }`}
                >
                  {diffResult.diffPercentage}%
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">Erro Médio:</span>
                <span className="font-bold text-slate-200">{diffResult.meanDelta}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {mode === 'overlay' && (
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">Modo de Mistura:</span>
            {['difference', 'exclusion', 'normal', 'luminosity'].map((bm) => (
              <button
                key={bm}
                type="button"
                onClick={() => setBlendMode(bm)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize transition ${
                  blendMode === bm
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {bm === 'difference' ? 'Diferença (Inversão)' : bm}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-semibold">100% Real</span>
            <input
              type="range"
              min="0"
              max="100"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              className="w-36 accent-indigo-500"
            />
            <span className="text-blue-400 font-semibold">100% Render 3D</span>
            <span className="font-mono text-slate-300 w-8">{overlayOpacity}%</span>
          </div>
        </div>
      )}

      {mode === 'blink' && (
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsBlinking((v) => !v)}
              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1.5 transition"
            >
              {isBlinking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isBlinking ? 'Pausar Alternância' : 'Iniciar Alternância'}</span>
            </button>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Velocidade:</span>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={blinkSpeed}
                onChange={(e) => setBlinkSpeed(Number(e.target.value))}
                className="w-24 accent-indigo-500"
              />
              <span className="font-mono text-slate-300">{blinkSpeed} Hz</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Quadro Atual:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[11px] ${
                currentBlinkFrame === 'real'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
              }`}
            >
              {currentBlinkFrame === 'real' ? '● FOTO REAL' : '■ RENDER 3D'}
            </span>
          </div>
        </div>
      )}

      {/* Alignment calibration drawer */}
      {showAlignPanel && (
        <div className="px-4 py-3 bg-slate-950 border-b border-indigo-900/40 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-indigo-300 font-bold flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" /> Calibração de Câmera 3D:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Escala:</span>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.01"
                value={alignment.scale}
                onChange={(e) => setAlignment((a) => ({ ...a, scale: Number(e.target.value) }))}
                className="w-20 accent-indigo-500"
              />
              <span className="font-mono text-slate-300">
                {Math.round(alignment.scale * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Offset X:</span>
              <input
                type="range"
                min="-60"
                max="60"
                value={alignment.offsetX}
                onChange={(e) => setAlignment((a) => ({ ...a, offsetX: Number(e.target.value) }))}
                className="w-20 accent-indigo-500"
              />
              <span className="font-mono text-slate-300">{alignment.offsetX}px</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Offset Y:</span>
              <input
                type="range"
                min="-60"
                max="60"
                value={alignment.offsetY}
                onChange={(e) => setAlignment((a) => ({ ...a, offsetY: Number(e.target.value) }))}
                className="w-20 accent-indigo-500"
              />
              <span className="font-mono text-slate-300">{alignment.offsetY}px</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Rotação:</span>
              <input
                type="range"
                min="-5"
                max="5"
                step="0.2"
                value={alignment.rotation}
                onChange={(e) => setAlignment((a) => ({ ...a, rotation: Number(e.target.value) }))}
                className="w-16 accent-indigo-500"
              />
              <span className="font-mono text-slate-300">{alignment.rotation}°</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAlignment({ scale: 1, offsetX: 0, offsetY: 0, rotation: 0 })}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
          >
            Redefinir Alinhamento
          </button>
        </div>
      )}

      {/* Main Interactive Canvas Area */}
      <div
        className="relative w-full h-[520px] sm:h-[620px] bg-slate-950 flex items-center justify-center overflow-hidden select-none cursor-default"
        onMouseDown={(e) => {
          // If middle mouse or space+click, start panning
          if (e.button === 1 || (e.button === 0 && e.altKey)) {
            setIsPanning(true);
            panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
          }
        }}
      >
        {/* Transform Wrapper for Zoom and Pan */}
        <div
          className="relative w-full h-full flex items-center justify-center transition-transform duration-75"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
          }}
        >
          {/* 1. Split Screen Slider Mode */}
          {mode === 'split' && (
            <div
              ref={splitContainerRef}
              onClick={handleContainerClick}
              onMouseMove={(e) => handleLoupeMove(e, 'main')}
              onMouseLeave={handleLoupeLeave}
              className="relative w-full h-full max-w-4xl max-h-full flex items-center justify-center overflow-hidden"
            >
              {/* Underneath: Render 3D */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `translate(${alignment.offsetX}px, ${alignment.offsetY}px) scale(${alignment.scale}) rotate(${alignment.rotation}deg)`,
                }}
              >
                <img
                  src={renderImage}
                  alt="Render 3D"
                  className="max-w-full max-h-full object-contain pointer-events-none"
                />
              </div>

              {/* Clipped Over: Real Image */}
              <div
                className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none"
                style={{
                  clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)`,
                }}
              >
                <img
                  src={realImage}
                  alt="Foto Real"
                  className="max-w-full max-h-full object-contain pointer-events-none"
                />
              </div>

              {/* Split Divider Bar */}
              <div
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDraggingSplit(true);
                }}
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                style={{ left: `${splitPos}%` }}
              >
                {/* Drag Handle */}
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-white shadow-xl cursor-ew-resize hover:scale-110 active:scale-95 transition-transform">
                  <Columns2 className="w-4 h-4" />
                </div>
              </div>

              {/* Visual Labels */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-emerald-500/90 text-slate-950 uppercase tracking-wider shadow-lg">
                  Foto Real
                </span>
              </div>
              <div className="absolute top-4 right-4 z-10 pointer-events-none">
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-blue-500/90 text-white uppercase tracking-wider shadow-lg">
                  Render 3D
                </span>
              </div>

              {/* Magnifying Glass Lens in Split Mode */}
              {isLoupeActive &&
                loupeState.visible &&
                renderLoupeLens(
                  loupeTarget === 'real' ? (
                    <img src={realImage} alt="Real Zoom" className="w-full h-full object-contain" />
                  ) : loupeTarget === 'render' ? (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        transform: `translate(${alignment.offsetX}px, ${alignment.offsetY}px) scale(${alignment.scale}) rotate(${alignment.rotation}deg)`,
                      }}
                    >
                      <img src={renderImage} alt="Render Zoom" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                          transform: `translate(${alignment.offsetX}px, ${alignment.offsetY}px) scale(${alignment.scale}) rotate(${alignment.rotation}deg)`,
                        }}
                      >
                        <img src={renderImage} alt="Render 3D" className="w-full h-full object-contain" />
                      </div>
                      <div
                        className="absolute inset-0 flex items-center justify-center overflow-hidden"
                        style={{
                          clipPath: `polygon(0 0, ${splitPos}% 0, ${splitPos}% 100%, 0 100%)`,
                        }}
                      >
                        <img src={realImage} alt="Foto Real" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  ),
                  loupeTarget === 'real'
                    ? 'FOTO REAL'
                    : loupeTarget === 'render'
                      ? 'RENDER 3D'
                      : 'CORTINA'
                )}
            </div>
          )}

          {/* 2. Heatmap & Pixel Difference Mode */}
          {mode === 'heatmap' && (
            <div
              onClick={handleContainerClick}
              onMouseMove={(e) => handleLoupeMove(e, 'main')}
              onMouseLeave={handleLoupeLeave}
              className="relative w-full h-full max-w-4xl max-h-full flex items-center justify-center"
            >
              {isGeneratingDiff ? (
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Calculando discrepâncias de pixel...</span>
                </div>
              ) : diffResult ? (
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                  <img
                    src={diffResult.dataUrl}
                    alt="Mapa de Discrepâncias de Pixel"
                    className="max-w-full max-h-full object-contain rounded shadow-2xl"
                  />
                  {/* Heatmap Legend */}
                  <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur p-2.5 rounded-lg border border-slate-800 text-[11px] flex flex-col gap-1.5 shadow-xl">
                    <span className="font-semibold text-slate-300">Intensidade da Discrepância</span>
                    <div className="h-3 w-40 rounded bg-gradient-to-r from-blue-600 via-green-400 via-yellow-400 to-red-600" />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Idêntico</span>
                      <span>Médio</span>
                      <span>Crítico</span>
                    </div>
                  </div>

                  {/* Magnifying Glass Lens in Heatmap Mode */}
                  {isLoupeActive &&
                    loupeState.visible &&
                    renderLoupeLens(
                      <img
                        src={diffResult.dataUrl}
                        alt="Diff Zoom"
                        className="w-full h-full object-contain"
                      />,
                      'MAPA DIFF'
                    )}
                </div>
              ) : null}
            </div>
          )}

          {/* 3. Side-by-Side Synchronized Mode */}
          {mode === 'side_by_side' && (
            <div
              onClick={handleContainerClick}
              className="relative w-full h-full grid grid-cols-2 gap-4 p-4 max-w-6xl max-h-full"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setCrosshairPos({
                  x: ((e.clientX - rect.left) / rect.width) * 100,
                  y: ((e.clientY - rect.top) / rect.height) * 100,
                });
              }}
              onMouseLeave={() => {
                setCrosshairPos(null);
                handleLoupeLeave();
              }}
            >
              {/* Left Column: Real */}
              <div
                onMouseMove={(e) => handleLoupeMove(e, 'left')}
                onMouseLeave={handleLoupeLeave}
                className="relative w-full h-full flex flex-col items-center justify-center bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden"
              >
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    FOTO REAL
                  </span>
                </div>
                <img
                  src={realImage}
                  alt="Real"
                  className="max-w-full max-h-full object-contain pointer-events-none"
                />

                {/* Magnifying Glass Lens for Real Side */}
                {isLoupeActive &&
                  loupeState.visible &&
                  renderLoupeLens(
                    <img src={realImage} alt="Real Zoom" className="w-full h-full object-contain" />,
                    'FOTO REAL',
                    'border-emerald-400'
                  )}
              </div>

              {/* Right Column: 3D Render */}
              <div
                onMouseMove={(e) => handleLoupeMove(e, 'right')}
                onMouseLeave={handleLoupeLeave}
                className="relative w-full h-full flex flex-col items-center justify-center bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden"
              >
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    RENDER 3D
                  </span>
                </div>
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    transform: `translate(${alignment.offsetX}px, ${alignment.offsetY}px) scale(${alignment.scale}) rotate(${alignment.rotation}deg)`,
                  }}
                >
                  <img
                    src={renderImage}
                    alt="Render 3D"
                    className="max-w-full max-h-full object-contain pointer-events-none"
                  />
                </div>

                {/* Synchronized Magnifying Glass Lens for 3D Render Side */}
                {isLoupeActive &&
                  loupeState.visible &&
                  renderLoupeLens(
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        transform: `translate(${alignment.offsetX}px, ${alignment.offsetY}px) scale(${alignment.scale}) rotate(${alignment.rotation}deg)`,
                      }}
                    >
                      <img src={renderImage} alt="Render Zoom" className="w-full h-full object-contain" />
                    </div>,
                    'RENDER 3D',
                    'border-blue-400'
                  )}
              </div>
            </div>
          )}

          {/* 4. Overlay & Blend Mode */}
          {mode === 'overlay' && (
            <div
              onClick={handleContainerClick}
              onMouseMove={(e) => handleLoupeMove(e, 'main')}
              onMouseLeave={handleLoupeLeave}
              className="relative w-full h-full max-w-4xl max-h-full flex items-center justify-center"
            >
              {/* Base: Real Image */}
              <img
                src={realImage}
                alt="Base Real"
                className="max-w-full max-h-full object-contain absolute"
              />
              {/* Overlaid: Render 3D with blend mode and opacity */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  opacity: overlayOpacity / 100,
                  mixBlendMode: blendMode as any,
                  transform: `translate(${alignment.offsetX}px, ${alignment.offsetY}px) scale(${alignment.scale}) rotate(${alignment.rotation}deg)`,
                }}
              >
                <img
                  src={renderImage}
                  alt="Render 3D Overlaid"
                  className="max-w-full max-h-full object-contain pointer-events-none"
                />
              </div>

              {/* Magnifying Glass Lens in Overlay Mode */}
              {isLoupeActive &&
                loupeState.visible &&
                renderLoupeLens(
                  <div className="relative w-full h-full">
                    <img src={realImage} alt="Base" className="w-full h-full object-contain absolute" />
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        opacity: overlayOpacity / 100,
                        mixBlendMode: blendMode as any,
                        transform: `translate(${alignment.offsetX}px, ${alignment.offsetY}px) scale(${alignment.scale}) rotate(${alignment.rotation}deg)`,
                      }}
                    >
                      <img src={renderImage} alt="Overlay" className="w-full h-full object-contain" />
                    </div>
                  </div>,
                  'MISTURA'
                )}
            </div>
          )}

          {/* 5. Blink Comparator Mode */}
          {mode === 'blink' && (
            <div
              onClick={handleContainerClick}
              onMouseMove={(e) => handleLoupeMove(e, 'main')}
              onMouseLeave={handleLoupeLeave}
              className="relative w-full h-full max-w-4xl max-h-full flex items-center justify-center"
            >
              {currentBlinkFrame === 'real' ? (
                <img
                  src={realImage}
                  alt="Blink Real"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    transform: `translate(${alignment.offsetX}px, ${alignment.offsetY}px) scale(${alignment.scale}) rotate(${alignment.rotation}deg)`,
                  }}
                >
                  <img
                    src={renderImage}
                    alt="Blink 3D"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}

              {/* Magnifying Glass Lens in Blink Mode */}
              {isLoupeActive &&
                loupeState.visible &&
                renderLoupeLens(
                  currentBlinkFrame === 'real' ? (
                    <img src={realImage} alt="Blink Real" className="w-full h-full object-contain" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{
                        transform: `translate(${alignment.offsetX}px, ${alignment.offsetY}px) scale(${alignment.scale}) rotate(${alignment.rotation}deg)`,
                      }}
                    >
                      <img src={renderImage} alt="Blink 3D" className="w-full h-full object-contain" />
                    </div>
                  ),
                  currentBlinkFrame === 'real' ? 'FOTO REAL' : 'RENDER 3D'
                )}
            </div>
          )}

          {/* AI Bounding Boxes Layer (Overlaid in 1-image views like split, heatmap, overlay, blink) */}
          {showAiBoxes && mode !== 'side_by_side' && (
            <div className="absolute inset-0 max-w-4xl max-h-full m-auto pointer-events-none">
              {discrepancies.map((disc, idx) => {
                const [ymin, xmin, ymax, xmax] = disc.box2d;
                const top = `${(ymin / 1000) * 100}%`;
                const left = `${(xmin / 1000) * 100}%`;
                const width = `${((xmax - xmin) / 1000) * 100}%`;
                const height = `${((ymax - ymin) / 1000) * 100}%`;
                const isSelected = selectedDiscrepancyId === disc.id;

                const borderColor =
                  disc.severity === 'critical'
                    ? 'border-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.6)]'
                    : disc.severity === 'moderate'
                      ? 'border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                      : 'border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]';

                const badgeBg =
                  disc.severity === 'critical'
                    ? 'bg-rose-500 text-white'
                    : disc.severity === 'moderate'
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-cyan-400 text-slate-950 font-bold';

                return (
                  <div
                    key={disc.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDiscrepancy(disc.id);
                    }}
                    style={{ top, left, width, height }}
                    className={`absolute border-2 rounded-lg pointer-events-auto cursor-pointer transition-all duration-200 group ${borderColor} ${
                      isSelected ? 'ring-4 ring-white/50 scale-[1.02]' : 'hover:scale-105'
                    }`}
                  >
                    {/* Index Tag */}
                    <div
                      className={`absolute -top-3.5 -left-3 px-1.5 py-0.5 rounded text-[10px] shadow-lg flex items-center gap-1 ${badgeBg}`}
                    >
                      <span>#{idx + 1}</span>
                    </div>

                    {/* Popover on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 pointer-events-none">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-xs text-white leading-tight">
                          {disc.title}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${badgeBg}`}>
                          {disc.severity === 'critical'
                            ? 'Crítico'
                            : disc.severity === 'moderate'
                              ? 'Moderado'
                              : 'Leve'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 line-clamp-2">{disc.description}</p>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] text-indigo-300">
                        Clique para ver recomendação no 3D
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* User Manual Annotation Pins */}
          {showManualPins && (
            <div className="absolute inset-0 max-w-4xl max-h-full m-auto pointer-events-none">
              {manualAnnotations.map((pin) => (
                <div
                  key={pin.id}
                  style={{ top: `${pin.y}%`, left: `${pin.x}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto group cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Deseja remover este pino de anotação?')) {
                      onRemoveAnnotation(pin.id);
                    }
                  }}
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-white shadow-xl hover:scale-125 transition-transform">
                    !
                  </div>
                  <div className="absolute left-full top-0 ml-2 w-48 p-2 bg-slate-900/95 border border-amber-500/40 rounded-lg text-[11px] text-slate-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-50">
                    <span className="font-semibold text-amber-400 block mb-0.5">Nota Manual:</span>
                    {pin.note}
                    <span className="text-[9px] text-slate-500 block mt-1">Clique para remover</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Guidance Bar */}
      <div className="px-4 py-2 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-4 flex-wrap">
          <span>💡 Arraste com Alt+Clique para mover (Pan)</span>
          <span>• Use a roda do mouse ou botões de zoom</span>
          {isLoupeActive && (
            <span className="text-amber-400 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              <Search className="w-3 h-3" /> Lupa {loupeZoom}x ativa: passe o mouse sobre a imagem
            </span>
          )}
          {isAddingPin && (
            <span className="text-amber-400 font-bold animate-pulse">
              📍 Clique em qualquer ponto da imagem para fixar uma nota
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Crítico
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" /> Moderado
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Leve
          </span>
        </div>
      </div>
    </div>
  );
};
