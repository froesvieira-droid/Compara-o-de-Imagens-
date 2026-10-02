import React from 'react';
import { X, Layers, Flame, Columns, Zap, CheckCircle2, Sliders, Info, Search } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        <div className="p-4 sm:p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-base sm:text-lg text-white">
              Guia de Inspeção Visual Real vs 3D
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Como a IA detecta discrepâncias?
            </h4>
            <p className="text-slate-400 text-xs">
              Nossa engine utiliza visão computacional multimodal avançada para correlacionar a
              foto física de referência com o modelo 3D renderizado. A análise examina
              sistematicamente chanfros de aresta (bevels), rugosidade de materiais PBR, fidelidade
              de texturas, penumbras de sombra, reflexos de estúdio e escala geométrica.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-white text-sm">Modos de Visualização Disponíveis:</h4>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
                <Columns className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">Cortina Dividida (Split Slider)</span>
                <span className="text-xs text-slate-400">
                  Arraste o divisor horizontalmente para revelar a transição contínua entre a foto
                  real e o modelo computacional.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">Mapa de Calor (Pixel Diff)</span>
                <span className="text-xs text-slate-400">
                  Calcula matematicamente a diferença delta RGB pixel a pixel. Cores quentes
                  (amarelo e vermelho) destacam desvios significativos de geometria, iluminação ou
                  cor.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">Sobreposição com Inversão (Difference)</span>
                <span className="text-xs text-slate-400">
                  Utiliza o clássico modo de mesclagem &ldquo;Difference&rdquo;: pixels idênticos
                  ficam 100% pretos, enquanto qualquer aresta deslocada ou textura divergente brilha
                  instantaneamente.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-400/20 text-amber-300 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">Piscar Alternado (Blink Comparator)</span>
                <span className="text-xs text-slate-400">
                  Técnica amplamente usada em controle de qualidade de VFX e astronomia. Alterna em
                  alta velocidade entre as duas imagens; o olho humano detecta movimentos e
                  discrepâncias sutis instantaneamente.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">Modo Lupa (Magnifying Glass / Pixel Zoom)</span>
                <span className="text-xs text-slate-400">
                  Ative o botão &ldquo;Lupa&rdquo; na barra superior para inspecionar microdetalhes
                  com ampliações de 2x, 3x, 4x e 8x. Acompanha retículo com mira e grade de sub-pixels,
                  permitindo examinar chanfros, porosidade de texturas PBR e serrilhado em nível de pixel.
                  No modo Lado a Lado, as duas imagens são ampliadas de forma sincronizada!
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-300">
            <strong>Dica de Calibração:</strong> Se o render 3D estiver ligeiramente desalinhado com
            a foto real (diferença milimétrica de ângulo de câmera ou corte), abra o painel de
            calibração no topo do visualizador para ajustar a escala e o offset X/Y antes da
            inspeção de pixels!
          </div>
        </div>
      </div>
    </div>
  );
};
