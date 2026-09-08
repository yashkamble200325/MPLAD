import { ProjectFeatureVector, IsolationForestResult, ContributingFeature } from './types';

interface ITreeNode {
  isLeaf: boolean;
  size: number;
  splitFeature?: number;
  splitValue?: number;
  left?: ITreeNode;
  right?: ITreeNode;
}

// Average path length formula c(n) for BST / Isolation Forest
export function c(n: number): number {
  if (n <= 1) return 0;
  if (n === 2) return 1;
  const euler = 0.5772156649;
  return 2 * (Math.log(n - 1) + euler) - (2 * (n - 1)) / n;
}

// Feature indices:
// 0: costOverrunPct (0 - 200)
// 1: financialUtilization (0 - 250)
// 2: progressExpenditureGap (-50 - 100)
// 3: delayDays (0 - 365)
// 4: paymentClusteringIndex (0 - 100)
// 5: historicalCostBenchmarkRatio (0.2 - 3.0)
// 6: progressVelocity (0 - 1.0)

const FEATURE_NAMES = [
  { key: 'costOverrunPct', label: 'Cost Overrun %', benchmark: '< 10% expected' },
  { key: 'financialUtilization', label: 'Financial Utilization %', benchmark: '≤ 100% sanctioned' },
  { key: 'progressExpenditureGap', label: 'Progress vs Expenditure Gap', benchmark: '< 15 pts normal' },
  { key: 'delayDays', label: 'Milestone Lag (Days)', benchmark: '< 30 days normal' },
  { key: 'paymentClusteringIndex', label: 'Disbursement Velocity Index', benchmark: '< 40 normal velocity' },
  { key: 'historicalCostBenchmarkRatio', label: 'Category Cost Benchmark Ratio', benchmark: '0.8x - 1.2x expected' },
  { key: 'progressVelocity', label: 'Physical Progress Velocity', benchmark: '> 0.25%/day expected' },
];

function featureVectorToArray(fv: ProjectFeatureVector): number[] {
  return [
    fv.costOverrunPct,
    fv.financialUtilization,
    fv.progressExpenditureGap,
    fv.delayDays,
    fv.paymentClusteringIndex,
    fv.historicalCostBenchmarkRatio,
    fv.progressVelocity,
  ];
}

// Calibrated reference dataset representing standard municipal / rural infrastructure behavior
// Contains standard compliant projects, slight variances, and known boundary profiles.
const BASELINE_SAMPLES: number[][] = [
  // Normal projects: balanced expenditure and progress, minor delay
  [0, 65, 5, 10, 25, 0.95, 0.35],
  [0, 45, -2, 0, 20, 0.88, 0.40],
  [4.2, 78, 8, 25, 30, 1.02, 0.31],
  [0, 92, 2, 15, 35, 0.99, 0.33],
  [8.5, 88, 12, 35, 32, 1.05, 0.28],
  [0, 30, 0, 0, 15, 0.82, 0.45],
  [2.1, 55, 6, 12, 28, 0.94, 0.38],
  [0, 80, 4, 18, 30, 0.98, 0.36],
  [5.0, 70, 7, 20, 25, 1.01, 0.32],
  [0, 95, 3, 5, 33, 0.97, 0.34],
  [0, 40, -5, 0, 18, 0.85, 0.42],
  [1.5, 60, 4, 8, 22, 0.92, 0.39],
  [6.8, 82, 10, 28, 31, 1.04, 0.30],
  [0, 50, 2, 5, 24, 0.90, 0.37],
  [3.3, 75, 5, 14, 27, 0.96, 0.34],
  [0, 85, 1, 10, 29, 0.95, 0.35],
  // Moderate projects: some delays or slightly higher gap
  [14.5, 98, 22, 65, 48, 1.25, 0.22],
  [12.0, 90, 18, 55, 42, 1.18, 0.24],
  [18.2, 105, 24, 78, 52, 1.30, 0.20],
  [9.5, 88, 19, 48, 45, 1.15, 0.25],
  // Boundary / anomalous projects
  [45.0, 140, 42, 110, 75, 1.85, 0.12],
  [115.9, 215, 31, 127, 88, 2.37, 0.14],
  [68.4, 168, 52, 145, 82, 1.95, 0.09],
  [35.2, 125, 38, 92, 70, 1.60, 0.16],
];

export class IsolationForest {
  private trees: ITreeNode[] = [];
  private numTrees: number;
  private sampleSize: number;
  private maxDepth: number;

  constructor(numTrees: number = 100, sampleSize: number = 24) {
    this.numTrees = numTrees;
    this.sampleSize = Math.min(sampleSize, BASELINE_SAMPLES.length);
    this.maxDepth = Math.ceil(Math.log2(Math.max(2, this.sampleSize)));
    this.buildEnsemble();
  }

  // Build recursive isolation tree
  private buildTree(data: number[][], currentDepth: number): ITreeNode {
    if (currentDepth >= this.maxDepth || data.length <= 1) {
      return { isLeaf: true, size: data.length };
    }

    const numFeatures = data[0].length;
    // Pick random feature
    const featureIdx = Math.floor(Math.random() * numFeatures);

    let minVal = Infinity;
    let maxVal = -Infinity;
    for (const row of data) {
      if (row[featureIdx] < minVal) minVal = row[featureIdx];
      if (row[featureIdx] > maxVal) maxVal = row[featureIdx];
    }

    if (minVal >= maxVal) {
      return { isLeaf: true, size: data.length };
    }

    // Pick uniform random split point between min and max
    const splitValue = minVal + Math.random() * (maxVal - minVal);

    const leftData = data.filter((row) => row[featureIdx] < splitValue);
    const rightData = data.filter((row) => row[featureIdx] >= splitValue);

    if (leftData.length === 0 || rightData.length === 0) {
      return { isLeaf: true, size: data.length };
    }

    return {
      isLeaf: false,
      size: data.length,
      splitFeature: featureIdx,
      splitValue,
      left: this.buildTree(leftData, currentDepth + 1),
      right: this.buildTree(rightData, currentDepth + 1),
    };
  }

  private buildEnsemble(): void {
    this.trees = [];
    for (let t = 0; t < this.numTrees; t++) {
      // Subsample baseline data
      const sampleIndices = new Set<number>();
      while (sampleIndices.size < this.sampleSize) {
        sampleIndices.add(Math.floor(Math.random() * BASELINE_SAMPLES.length));
      }
      const sample = Array.from(sampleIndices).map((idx) => BASELINE_SAMPLES[idx]);
      const tree = this.buildTree(sample, 0);
      this.trees.push(tree);
    }
  }

  // Compute path length h(x) through a tree
  private getPathLength(node: ITreeNode, x: number[], currentDepth: number): { depth: number; featureSplits: number[] } {
    if (node.isLeaf) {
      return {
        depth: currentDepth + c(node.size),
        featureSplits: [],
      };
    }

    const featureIdx = node.splitFeature!;
    const splitVal = node.splitValue!;
    const nextNode = x[featureIdx] < splitVal ? node.left! : node.right!;
    const res = this.getPathLength(nextNode, x, currentDepth + 1);
    res.featureSplits.push(featureIdx);
    return res;
  }

  // Predict anomaly score for an instance x
  public predict(fv: ProjectFeatureVector): IsolationForestResult {
    const x = featureVectorToArray(fv);
    const n = this.sampleSize;
    const avgExpectedLength = c(n);

    let totalPathLength = 0;
    const featureSplitCounts = new Array(x.length).fill(0);

    for (const tree of this.trees) {
      const { depth, featureSplits } = this.getPathLength(tree, x, 0);
      totalPathLength += depth;
      for (const feat of featureSplits) {
        featureSplitCounts[feat]++;
      }
    }

    const meanPathLength = totalPathLength / this.trees.length;
    // Isolation score: s = 2^(-E(h(x)) / c(n))
    const rawScore = Math.pow(2, -(meanPathLength / Math.max(0.1, avgExpectedLength)));

    // Scale raw anomaly score: normal projects center near ~0.45-0.52 (giving ~10-35/100)
    // Anomalous projects center near 0.65-0.85+ (giving 70-98/100)
    const normalizedScore = Math.min(
      100,
      Math.max(5, Math.round(((rawScore - 0.40) / 0.38) * 100))
    );

    const isAnomalous = normalizedScore >= 65;

    // Determine contributing features based on how early they isolated the point
    const contributingFeatures: ContributingFeature[] = FEATURE_NAMES.map((meta, idx) => {
      const val = x[idx];
      const baselineAvg =
        BASELINE_SAMPLES.reduce((acc, row) => acc + row[idx], 0) / BASELINE_SAMPLES.length;
      const deviation = (val - baselineAvg) / Math.max(0.01, baselineAvg);
      const splitFreq = featureSplitCounts[idx] / this.trees.length;

      let contribution = Math.round(deviation * 25 * (splitFreq > 0.3 ? 1.4 : 1.0));
      if (idx === 6) {
        // Lower velocity increases risk
        contribution = val < 0.2 ? Math.abs(contribution) : -Math.abs(contribution);
      }

      return {
        name: meta.key,
        displayName: meta.label,
        value: typeof val === 'number' ? Number(val.toFixed(2)) : val,
        contribution,
        direction: (contribution > 5
          ? 'increases_risk'
          : contribution < -5
          ? 'decreases_risk'
          : 'neutral') as 'increases_risk' | 'decreases_risk' | 'neutral',
        benchmark: meta.benchmark,
      };
    }).sort((a, b) => b.contribution - a.contribution);

    let summary = 'Standard operational parameter range across all monitored dimensions.';
    if (normalizedScore >= 80) {
      summary = `Severe multidimensional anomaly detected: path depth (${meanPathLength.toFixed(1)}) is significantly shallower than normal expectation (${avgExpectedLength.toFixed(1)}). Major deviations in ${contributingFeatures[0].displayName} and ${contributingFeatures[1].displayName}.`;
    } else if (normalizedScore >= 60) {
      summary = `Moderate statistical anomaly identified: elevated ${contributingFeatures[0].displayName} deviates from comparable district works.`;
    }

    return {
      anomalyScore: normalizedScore,
      rawAnomalyScore: Number(rawScore.toFixed(4)),
      isAnomalous,
      pathLength: Number(meanPathLength.toFixed(2)),
      averagePathLength: Number(meanPathLength.toFixed(2)),
      expectedPathLength: Number(avgExpectedLength.toFixed(2)),
      contributingFeatures,
      summary,
    };
  }
}

// Export singleton instance initialized with calibrated baseline
export const isolationForestModel = new IsolationForest(100, 24);
