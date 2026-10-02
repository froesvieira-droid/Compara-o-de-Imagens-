import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Target,
  Wrench,
  Layers,
  Sun,
  Palette,
  Box,
} from 'lucide-react';
import { ComparisonResult, Discrepancy, Severity, DiscrepancyCategory } from '../types';

interface AuditInspectorProps {
  result: ComparisonResult;
  selectedDiscrepancyId: string | null;
  onSelectDiscrepancy: (id: string | null) => void;
}

export const AuditInspector: React.FC<AuditInspectorProps> = ({
  result,
  selectedDiscrepancyId,
  onSelectDiscrepancy,
}) => {
  const [severityFilter, setSeverityFilter] = useState<'all' | Severity>('all');
  const [expandedId, setExpandedId] = useState<string | null>(
    selectedDiscrepancyId || result.discrepancies[0]?.id || null
  );

  // Sync expanded card if selected from viewer
  React.useEffect(() => {
    if (selectedDiscrepancyId) {
      setExpandedId(selectedDiscrepancyId);
    }
  }, [selectedDiscrepancyId]);

  const filteredDiscrepancies = result.discrepancies.filter((d) => {
    if (severityFilter === 'all') return true;
    return d.severity === severityFilter;
  });

  const getVerdictDetails = (verdict: string, score: number) => {
    if (score >= 90) {
      return {
        label: 'Altíssima Fidelidade (Quase Idêntico)',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        barColor: 'from-emerald-500 to-teal-400',
        icon: ShieldCheck,
      };
    }
    if (score >= 75) {
      return {
        label: 'Boa Fidelidade com Desvios Notáveis',
        color: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30',
        barColor: 'from-indigo-500 to-cyan-400',
        icon: CheckCircle2,
      };
    }
    if (score >= 50) {
      return {
        label: 'Discrepâncias Moderadas Encontradas',
        color: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
        barColor: 'from-amber-500 to-yellow-400',
        icon: AlertTriangle,
      };
    }
    return {
      label: 'Discrepâncias Críticas Identificadas',
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      barColor: 'from-rose-500 to-pink-500',
      icon: ShieldAlert,
    };
  };

  const verdictMeta = getVerdictDetails(result.verdict, result.matchScore);
  const VerdictIcon = verdictMeta.icon;

  const getCategoryIcon = (cat: DiscrepancyCategory) => {
    switch (cat) {
      case 'geometry':
        return <Box className="w-3.5 h-3.5 text-blue-400" />;
      case 'material_texture':
        return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      case 'lighting_shadows':
        return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'color_tone':
        return <Palette className="w-3.5 h-3.5 text-pink-400" />;
      default:
        return <Sliders className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getCategoryLabel = (cat: DiscrepancyCategory) => {
    switch (cat) {
      case 'geometry':
        return 'Geometria & Chanfros';
      case 'material_texture':
        return 'Material & Textura PBR';
      case 'lighting_shadows':
        return 'Iluminação & Sombras';
      case 'color_tone':
        return 'Cores & Tonalidade';
      case 'details_missing':
        return 'Detalhe Ausente';
      case 'perspective_angle':
        return 'Perspectiva & Ângulo';
      default:
        return cat;
    }
  };

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl h-full">
      {/* Header with Score Dial */}
      <div className="p-5 bg-slate-950/70 border-b border-slate-800">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Índice Geral de Fidelidade
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-white">
                {result.matchScore}%
              </span>
              <span className="text-xs text-slate-400 font-medium">de equivalência visual</span>
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${verdictMeta.color}`}
          >
            <VerdictIcon className="w-4 h-4 shrink-0" />
            <span>{verdictMeta.label}</span>
          </div>
        </div>

        {/* Executive Summary */}
        <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
          {result.summary}
        </p>

        {/* Category Breakdown Bars */}
        <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-slate-800/60">
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Geometria</span>
              <span className="font-semibold text-slate-200">
                {result.categoryScores.geometry}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${result.categoryScores.geometry}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Materiais PBR</span>
              <span className="font-semibold text-slate-200">
                {result.categoryScores.materials}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${result.categoryScores.materials}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Iluminação</span>
              <span className="font-semibold text-slate-200">
                {result.categoryScores.lighting}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${result.categoryScores.lighting}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Cores</span>
              <span className="font-semibold text-slate-200">
                {result.categoryScores.colors}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${result.categoryScores.colors}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Discrepancies Header & Severity Filter Tabs */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Discrepâncias ({result.discrepancies.length})
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            type="button"
            onClick={() => setSeverityFilter('all')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              severityFilter === 'all'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('critical')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              severityFilter === 'critical'
                ? 'bg-rose-500 text-white'
                : 'text-rose-400 hover:text-rose-300'
            }`}
          >
            Críticas
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('moderate')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              severityFilter === 'moderate'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            Moderadas
          </button>
          <button
            type="button"
            onClick={() => setSeverityFilter('minor')}
            className={`px-2 py-0.5 rounded font-medium transition ${
              severityFilter === 'minor'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-cyan-400 hover:text-cyan-300'
            }`}
          >
            Leves
          </button>
        </div>
      </div>

      {/* Discrepancies Accordion List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px]">
        {filteredDiscrepancies.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            Nenhuma discrepância encontrada para o filtro selecionado.
          </div>
        ) : (
          filteredDiscrepancies.map((disc, idx) => {
            const isExpanded = expandedId === disc.id;
            const isSelected = selectedDiscrepancyId === disc.id;

            const severityBadge =
              disc.severity === 'critical'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : disc.severity === 'moderate'
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';

            const severityDot =
              disc.severity === 'critical'
                ? 'bg-rose-500'
                : disc.severity === 'moderate'
                  ? 'bg-amber-400'
                  : 'bg-cyan-400';

            return (
              <div
                key={disc.id}
                className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? 'border-indigo-500 bg-slate-800/80 shadow-lg ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                {/* Accordion Trigger */}
                <div
                  onClick={() => {
                    setExpandedId(isExpanded ? null : disc.id);
                    onSelectDiscrepancy(disc.id);
                  }}
                  className="p-3.5 cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-xs font-bold text-slate-500 shrink-0">
                      #{idx + 1}
                    </span>
                    <span className={`w-2 h-2 rounded-full shrink-0 ${severityDot}`} />
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
                        {disc.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          {getCategoryIcon(disc.category)}
                          {getCategoryLabel(disc.category)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${severityBadge}`}
                    >
                      {disc.severity === 'critical'
                        ? 'Crítico'
                        : disc.severity === 'moderate'
                          ? 'Moderado'
                          : 'Leve'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-3.5 pb-4 pt-1 border-t border-slate-800/60 space-y-3 text-xs">
                    {/* General Explanation */}
                    <p className="text-slate-300 leading-relaxed">{disc.description}</p>

                    {/* Dual Observation Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <span>📸 Na Foto Real:</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {disc.realImageObservation}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-blue-950/20 border border-blue-900/40">
                        <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <span>🧊 No Render 3D:</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {disc.renderImageObservation}
                        </p>
                      </div>
                    </div>

                    {/* Actionable 3D Recommendation */}
                    <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/50">
                      <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Recomendação Técnica de Correção no 3D:</span>
                      </div>
                      <p className="text-slate-200 text-xs leading-relaxed font-medium">
                        {disc.recommendation}
                      </p>
                    </div>

                    {/* Focus on Canvas Action */}
                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDiscrepancy(disc.id);
                        }}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition"
                      >
                        <Target className="w-3.5 h-3.5" />
                        <span>Destacar na Imagem</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Strengths Footer */}
      {result.strengths && result.strengths.length > 0 && (
        <div className="p-4 bg-slate-950/80 border-t border-slate-800">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pontos de Êxito Notável no Modelo 3D:</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {result.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
