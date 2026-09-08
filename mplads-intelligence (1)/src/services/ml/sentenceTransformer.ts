import { Project, MaharashtraDistrict } from '../../types';
import { SemanticMatchResult } from './types';

// Domain vocabulary embeddings mapping key public infrastructure tokens to 32-dimensional dense space
// This simulates pre-trained Sentence-BERT / MiniLM domain representations for civic infrastructure works
const VOCAB_CLUSTERS: Record<string, number[]> = {
  health: [0.85, 0.92, 0.12, 0.05, 0.78, 0.88, 0.22, 0.10, 0.80, 0.70, 0.15, 0.05, 0.85, 0.65, 0.10, 0.05, 0.82, 0.75, 0.12, 0.08, 0.90, 0.80, 0.10, 0.05, 0.75, 0.85, 0.12, 0.04, 0.80, 0.78, 0.11, 0.06],
  medical: [0.82, 0.90, 0.15, 0.08, 0.75, 0.85, 0.20, 0.12, 0.78, 0.68, 0.18, 0.08, 0.82, 0.62, 0.12, 0.08, 0.80, 0.72, 0.15, 0.10, 0.88, 0.78, 0.12, 0.08, 0.72, 0.82, 0.15, 0.06, 0.78, 0.75, 0.14, 0.08],
  clinic: [0.78, 0.88, 0.10, 0.04, 0.72, 0.82, 0.18, 0.08, 0.75, 0.65, 0.12, 0.04, 0.80, 0.60, 0.08, 0.04, 0.76, 0.70, 0.10, 0.06, 0.85, 0.75, 0.08, 0.04, 0.70, 0.80, 0.10, 0.04, 0.75, 0.72, 0.10, 0.05],
  hospital: [0.88, 0.95, 0.18, 0.10, 0.82, 0.90, 0.25, 0.15, 0.82, 0.72, 0.20, 0.10, 0.88, 0.68, 0.15, 0.10, 0.85, 0.78, 0.18, 0.12, 0.92, 0.82, 0.15, 0.10, 0.78, 0.88, 0.18, 0.08, 0.82, 0.80, 0.16, 0.10],
  water: [0.12, 0.08, 0.92, 0.88, 0.10, 0.05, 0.85, 0.78, 0.15, 0.10, 0.90, 0.82, 0.10, 0.05, 0.88, 0.75, 0.12, 0.08, 0.86, 0.80, 0.10, 0.05, 0.85, 0.78, 0.15, 0.10, 0.92, 0.85, 0.12, 0.08, 0.88, 0.82],
  pipeline: [0.15, 0.10, 0.88, 0.85, 0.12, 0.08, 0.82, 0.75, 0.18, 0.12, 0.86, 0.78, 0.12, 0.08, 0.85, 0.72, 0.15, 0.10, 0.82, 0.76, 0.12, 0.08, 0.82, 0.75, 0.18, 0.12, 0.88, 0.82, 0.15, 0.10, 0.85, 0.78],
  borewell: [0.10, 0.05, 0.90, 0.86, 0.08, 0.04, 0.84, 0.76, 0.12, 0.08, 0.88, 0.80, 0.08, 0.04, 0.86, 0.74, 0.10, 0.06, 0.84, 0.78, 0.08, 0.04, 0.84, 0.76, 0.12, 0.08, 0.90, 0.84, 0.10, 0.06, 0.86, 0.80],
  road: [0.20, 0.15, 0.22, 0.18, 0.88, 0.92, 0.15, 0.10, 0.85, 0.78, 0.20, 0.15, 0.90, 0.82, 0.18, 0.12, 0.86, 0.80, 0.15, 0.10, 0.82, 0.75, 0.15, 0.10, 0.88, 0.90, 0.20, 0.15, 0.85, 0.80, 0.18, 0.12],
  asphalt: [0.18, 0.12, 0.20, 0.15, 0.85, 0.90, 0.12, 0.08, 0.82, 0.75, 0.18, 0.12, 0.88, 0.80, 0.15, 0.10, 0.84, 0.78, 0.12, 0.08, 0.80, 0.72, 0.12, 0.08, 0.85, 0.88, 0.18, 0.12, 0.82, 0.78, 0.15, 0.10],
  concrete: [0.22, 0.18, 0.25, 0.20, 0.86, 0.88, 0.18, 0.12, 0.84, 0.76, 0.22, 0.18, 0.86, 0.78, 0.20, 0.15, 0.85, 0.82, 0.18, 0.12, 0.80, 0.74, 0.18, 0.12, 0.84, 0.86, 0.22, 0.18, 0.84, 0.82, 0.20, 0.15],
  hall: [0.45, 0.50, 0.30, 0.25, 0.65, 0.70, 0.40, 0.35, 0.60, 0.55, 0.35, 0.30, 0.65, 0.60, 0.35, 0.30, 0.62, 0.58, 0.32, 0.28, 0.68, 0.62, 0.30, 0.25, 0.64, 0.68, 0.35, 0.30, 0.62, 0.60, 0.32, 0.28],
  community: [0.50, 0.55, 0.35, 0.30, 0.68, 0.72, 0.45, 0.40, 0.65, 0.58, 0.38, 0.32, 0.68, 0.62, 0.38, 0.32, 0.65, 0.60, 0.35, 0.30, 0.70, 0.65, 0.32, 0.28, 0.66, 0.70, 0.38, 0.32, 0.65, 0.62, 0.35, 0.30],
  school: [0.60, 0.65, 0.25, 0.20, 0.55, 0.60, 0.30, 0.25, 0.70, 0.75, 0.25, 0.20, 0.60, 0.55, 0.25, 0.20, 0.65, 0.68, 0.25, 0.20, 0.72, 0.70, 0.22, 0.18, 0.62, 0.65, 0.28, 0.22, 0.68, 0.70, 0.24, 0.18],
  classroom: [0.58, 0.62, 0.22, 0.18, 0.52, 0.58, 0.28, 0.22, 0.68, 0.72, 0.22, 0.18, 0.58, 0.52, 0.22, 0.18, 0.62, 0.65, 0.22, 0.18, 0.70, 0.68, 0.20, 0.16, 0.60, 0.62, 0.25, 0.20, 0.65, 0.68, 0.22, 0.16],
  construction: [0.35, 0.30, 0.30, 0.25, 0.75, 0.80, 0.30, 0.25, 0.70, 0.65, 0.30, 0.25, 0.72, 0.68, 0.28, 0.22, 0.70, 0.68, 0.28, 0.22, 0.65, 0.60, 0.28, 0.22, 0.72, 0.76, 0.32, 0.26, 0.68, 0.66, 0.30, 0.24],
};

// Compute 32-dim normalized embedding for a text string
export function embedText(text: string): number[] {
  const tokens = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const vec = new Array(32).fill(0);

  let matchCount = 0;
  for (const token of tokens) {
    for (const [key, clusterVec] of Object.entries(VOCAB_CLUSTERS)) {
      if (token.includes(key) || key.includes(token)) {
        matchCount++;
        for (let i = 0; i < 32; i++) {
          vec[i] += clusterVec[i];
        }
      }
    }
  }

  // Fallback hash embedding if no domain keywords hit
  if (matchCount === 0) {
    for (let i = 0; i < tokens.length; i++) {
      const code = tokens[i].charCodeAt(0) || 50;
      vec[i % 32] += (code % 20) / 20;
    }
  }

  // L2 Normalization: v / ||v||
  const norm = Math.sqrt(vec.reduce((acc, v) => acc + v * v, 0));
  if (norm === 0) return vec;
  return vec.map((v) => v / norm);
}

// Cosine similarity: (A · B)
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dot = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
  }
  return Math.min(1.0, Math.max(0.0, dot));
}

// Distance approximation between two locations (coordinates or district match)
function calculateGeoProximity(distA: MaharashtraDistrict, distB: MaharashtraDistrict): number {
  if (distA === distB) return 1.0;
  const adjacentDistricts: Record<string, string[]> = {
    'Pune': ['Satara', 'Raigad', 'Thane', 'Nashik'],
    'Mumbai': ['Thane', 'Raigad'],
    'Thane': ['Mumbai', 'Raigad', 'Nashik', 'Pune'],
    'Nashik': ['Thane', 'Pune', 'Chhatrapati Sambhajinagar'],
    'Kolhapur': ['Satara', 'Ratnagiri'],
  };
  if (adjacentDistricts[distA]?.includes(distB)) return 0.65;
  return 0.20;
}

export class SentenceTransformerEngine {
  // Compare two specific projects
  public compareProjects(target: Project, reference: Project): SemanticMatchResult {
    const embA = embedText(`${target.name} ${target.category} ${target.implementingAgency}`);
    const embB = embedText(`${reference.name} ${reference.category} ${reference.implementingAgency}`);

    const textCosine = cosineSimilarity(embA, embB);
    const categoryMatch = target.category === reference.category;
    const geoScore = calculateGeoProximity(target.district, reference.district);

    // Multi-factor weighted similarity:
    // Text embedding: 60%
    // Category match: 20%
    // Geographic proximity: 20%
    const combinedScore = Math.min(
      100,
      Math.max(
        5,
        Math.round(
          textCosine * 60 +
            (categoryMatch ? 20 : 5) +
            geoScore * 20
        )
      )
    );

    let classification: 'Low Similarity' | 'Moderate Similarity' | 'High Similarity' | 'Very High Similarity' = 'Low Similarity';
    if (combinedScore >= 90) classification = 'Very High Similarity';
    else if (combinedScore >= 80) classification = 'High Similarity';
    else if (combinedScore >= 60) classification = 'Moderate Similarity';

    const statusLabel =
      combinedScore >= 80
        ? 'Potential Duplicate — Verification Required'
        : 'Low Risk of Overlap';

    let explanation = `Semantic similarity score is ${combinedScore}%. Textual overlap is within non-conflicting operational bounds.`;
    if (combinedScore >= 85) {
      explanation = `High semantic and geographic convergence (${combinedScore}%) with ${reference.id} in ${reference.district}. Scope items, bill of quantities (BoQ), and agency footprints require physical verification to prevent double disbursement.`;
    } else if (combinedScore >= 65) {
      explanation = `Moderate contextual overlap (${combinedScore}%) observed with ${reference.id}. Standard cross-scheme verification advised.`;
    }

    const geoDist = geoScore === 1.0 ? 5.2 : geoScore >= 0.6 ? 45.0 : 180.0;
    const costRatio =
      reference.sanctionedAmount > 0
        ? Number((target.sanctionedAmount / reference.sanctionedAmount).toFixed(2))
        : 1.0;

    return {
      score: combinedScore,
      classification,
      matchedProjectId: reference.id,
      matchedProjectName: reference.name,
      matchedDistrict: reference.district,
      textCosineSimilarity: Number(textCosine.toFixed(3)),
      semanticSimilarity: Number(textCosine.toFixed(3)),
      categoryMatch,
      geographicProximityKm: geoDist,
      geoDistanceKm: geoDist,
      costRatio,
      statusLabel,
      explanation,
    };
  }

  // Find most similar project in catalog
  public findBestMatch(target: Project, catalog: Project[]): SemanticMatchResult {
    const candidates = catalog.filter((p) => p.id !== target.id);
    if (candidates.length === 0) {
      return {
        score: target.duplicateSimilarity || 12,
        classification: 'Low Similarity',
        textCosineSimilarity: 0.15,
        semanticSimilarity: 0.15,
        categoryMatch: false,
        geographicProximityKm: 120,
        geoDistanceKm: 120,
        costRatio: 1.0,
        statusLabel: 'Low Risk of Overlap',
        explanation: 'No potential cross-scheme duplicates identified in catalog.',
      };
    }

    let bestResult: SemanticMatchResult = this.compareProjects(target, candidates[0]);
    for (let i = 1; i < candidates.length; i++) {
      const res = this.compareProjects(target, candidates[i]);
      if (res.score > bestResult.score) {
        bestResult = res;
      }
    }

    return bestResult;
  }
}

export const sentenceTransformer = new SentenceTransformerEngine();
