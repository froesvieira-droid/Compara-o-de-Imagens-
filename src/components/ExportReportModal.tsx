import React from 'react';
import { X, Printer, Download, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { ComparisonResult } from '../types';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ComparisonResult;
  realImage: string;
  renderImage: string;
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  result,
  realImage,
  renderImage,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `auditoria-diff3d-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-base sm:text-lg text-white">
              Relatório Oficial de Auditoria de Fidelidade Visual 3D
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadJSON}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 transition shadow-md shadow-indigo-600/30"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 printable-area bg-slate-900 text-slate-200">
          {/* Document Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold">
                Diff3D Quality Assurance Audit
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                Laudo de Comparação: Foto Real vs Render 3D
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Data da Inspeção: {new Date().toLocaleDateString('pt-BR')} às{' '}
                {new Date().toLocaleTimeString('pt-BR')}
              </p>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Fidelidade Visual
                </span>
                <span className="text-3xl font-black text-white">{result.matchScore}%</span>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Discrepâncias
                </span>
                <span className="text-2xl font-black text-amber-400">
                  {result.discrepancies.length}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Pair Thumbnails */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/60">
              <span className="text-xs font-bold text-emerald-400 block mb-2">1. FOTO REAL</span>
              <img
                src={realImage}
                alt="Foto Real"
                className="w-full h-44 object-contain rounded-lg"
              />
            </div>
            <div className="border border-slate-800 rounded-xl p-3 bg-slate-950/60">
              <span className="text-xs font-bold text-blue-400 block mb-2">2. RENDER 3D</span>
              <img
                src={renderImage}
                alt="Render 3D"
                className="w-full h-44 object-contain rounded-lg"
              />
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Resumo Executivo
            </h4>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm leading-relaxed text-slate-300">
              {result.summary}
            </div>
          </div>

          {/* Category Scores */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Métricas por Dimensão Técnica
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Geometria</span>
                <span className="text-xl font-extrabold text-blue-400">
                  {result.categoryScores.geometry}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Materiais PBR</span>
                <span className="text-xl font-extrabold text-purple-400">
                  {result.categoryScores.materials}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Iluminação</span>
                <span className="text-xl font-extrabold text-amber-400">
                  {result.categoryScores.lighting}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                <span className="text-xs text-slate-400 block">Cores</span>
                <span className="text-xl font-extrabold text-pink-400">
                  {result.categoryScores.colors}%
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Discrepancies Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Registro Detalhado de Discrepâncias & Recomendações
            </h4>
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Discrepância</th>
                    <th className="p-3">Severidade</th>
                    <th className="p-3">Foto Real vs 3D</th>
                    <th className="p-3">Ação Recomendada no 3D</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  {result.discrepancies.map((disc, idx) => (
                    <tr key={disc.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-3 font-semibold text-white">
                        {disc.title}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {disc.category}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            disc.severity === 'critical'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : disc.severity === 'moderate'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {disc.severity}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] space-y-1">
                        <div>
                          <span className="text-emerald-400 font-semibold">Real: </span>
                          <span className="text-slate-300">{disc.realImageObservation}</span>
                        </div>
                        <div>
                          <span className="text-blue-400 font-semibold">3D: </span>
                          <span className="text-slate-300">{disc.renderImageObservation}</span>
                        </div>
                      </td>
                      <td className="p-3 text-[11px] text-indigo-300 font-medium leading-relaxed">
                        {disc.recommendation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
