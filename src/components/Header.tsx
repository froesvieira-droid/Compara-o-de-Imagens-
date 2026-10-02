import React from 'react';
import { Layers, Sparkles, FileText, RefreshCw, HelpCircle, Eye } from 'lucide-react';

interface HeaderProps {
  onNewComparison: () => void;
  onOpenReport: () => void;
  onOpenHelp: () => void;
  hasResult: boolean;
  isAnalyzing: boolean;
  onQuickPreset: (presetId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewComparison,
  onOpenReport,
  onOpenHelp,
  hasResult,
  isAnalyzing,
  onQuickPreset,
}) => {
  return (
    <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 sticky top-0 z-40 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                Diff3D
              </span>
              <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Real vs 3D QA
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Inspeção visual & detecção de discrepâncias de fidelidade
            </p>
          </div>
        </div>

        {/* Quick Presets & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Presets Dropdown */}
          <div className="relative group hidden md:block">
            <button
              type="button"
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Exemplos Prontos</span>
            </button>
            <div className="absolute right-0 mt-1 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Carregar Pares de Teste
              </div>
              <button
                type="button"
                onClick={() => onQuickPreset('nordic-chair')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-700/70 text-slate-200 flex flex-col"
              >
                <span className="font-medium text-indigo-300">Cadeira Escandinava</span>
                <span className="text-[11px] text-slate-400">Madeira PBR, chanfros e couro</span>
              </button>
              <button
                type="button"
                onClick={() => onQuickPreset('luxury-perfume')}
                className="w-full text-left px-3 py-2 text-xs hover:bg-slate-700/70 text-slate-200 flex flex-col"
              >
                <span className="font-medium text-amber-300">Frasco de Perfume de Luxo</span>
                <span className="text-[11px] text-slate-400">Vidro, caustics e tampa dourada</span>
              </button>
            </div>
          </div>

          {/* Help Button */}
          <button
            type="button"
            onClick={onOpenHelp}
            title="Como funciona e dicas de auditoria"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Export Report Button */}
          {hasResult && (
            <button
              type="button"
              onClick={onOpenReport}
              className="text-xs font-medium px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar Relatório</span>
            </button>
          )}

          {/* New Comparison Button */}
          <button
            type="button"
            onClick={onNewComparison}
            disabled={isAnalyzing}
            className="text-xs font-medium px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">Nova Comparação</span>
          </button>
        </div>
      </div>
    </header>
  );
};
