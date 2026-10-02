export type Severity = 'critical' | 'moderate' | 'minor';

export type DiscrepancyCategory =
  | 'geometry'
  | 'material_texture'
  | 'lighting_shadows'
  | 'color_tone'
  | 'details_missing'
  | 'perspective_angle';

export interface Discrepancy {
  id: string;
  title: string;
  category: DiscrepancyCategory;
  severity: Severity;
  description: string;
  realImageObservation: string;
  renderImageObservation: string;
  recommendation: string;
  box2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
}

export interface CategoryScores {
  geometry: number;
  materials: number;
  lighting: number;
  colors: number;
}

export type Verdict =
  | 'IDENTICAL'
  | 'VERY_SIMILAR'
  | 'MODERATE_DIFFERENCES'
  | 'SIGNIFICANT_DIFFERENCES';

export interface ComparisonResult {
  matchScore: number; // 0-100
  verdict: Verdict;
  summary: string;
  strengths?: string[];
  categoryScores: CategoryScores;
  discrepancies: Discrepancy[];
}

export type ComparisonMode = 'split' | 'heatmap' | 'side_by_side' | 'overlay' | 'blink';

export type HeatmapStyle = 'turbo_heatmap' | 'neon_mask' | 'amplified_diff' | 'grayscale_diff';

export interface ManualAnnotation {
  id: string;
  x: number; // 0-100%
  y: number; // 0-100%
  note: string;
  createdAt: string;
}

export interface ImageAlignment {
  scale: number; // default 1.0 (0.8 to 1.2)
  offsetX: number; // pixels (-100 to 100)
  offsetY: number; // pixels (-100 to 100)
  rotation: number; // degrees (-10 to 10)
}

export interface SamplePreset {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  realImage: string;
  renderImage: string;
  description: string;
}
