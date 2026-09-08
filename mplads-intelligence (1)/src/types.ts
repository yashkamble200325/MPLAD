export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'MONITORING_OFFICER' 
  | 'DISTRICT_AUTHORITY' 
  | 'AUDITOR_INVESTIGATOR';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ProjectStatus = 
  | 'Sanctioned' 
  | 'In Progress' 
  | 'Under Investigation' 
  | 'Delayed' 
  | 'Completed' 
  | 'Halted';

export type ProjectCategory = 
  | 'Healthcare'
  | 'Drinking Water'
  | 'Road Development'
  | 'Community Hall'
  | 'School Infrastructure'
  | 'Sanitation'
  | 'Street Lighting'
  | 'Public Infrastructure';

export type MaharashtraDistrict = 
  | 'Pune'
  | 'Mumbai'
  | 'Thane'
  | 'Nagpur'
  | 'Nashik'
  | 'Raigad'
  | 'Kolhapur'
  | 'Satara'
  | 'Ratnagiri'
  | 'Chhatrapati Sambhajinagar';

export interface PaymentRecord {
  id: string;
  date: string;
  vendor: string;
  amount: number; // in Lakhs
  description: string;
  status: 'Approved' | 'Flagged' | 'Audited';
  invoiceNumber: string;
  isAnomalous?: boolean;
}

export interface RiskFactorScores {
  costAnomaly: number; // raw 0-100
  paymentAnomaly: number; // raw 0-100
  delayAnomaly: number; // raw 0-100
  duplicateSimilarity: number; // raw 0-100
  progressDeviation: number; // raw 0-100
}

export interface RiskWeights {
  costAnomaly: number; // default 25
  paymentAnomaly: number; // default 20
  delayAnomaly: number; // default 20
  duplicateSimilarity: number; // default 20
  progressDeviation: number; // default 15
}

export interface Project {
  id: string;
  uuid?: string;
  dbId?: string;
  name: string;
  district: MaharashtraDistrict;
  category: ProjectCategory;
  sanctionedAmount: number; // in Lakhs
  expenditure: number; // in Lakhs
  physicalProgress: number; // percentage 0-100
  financialUtilization: number; // percentage 0-100
  startDate: string;
  expectedCompletionDate: string;
  delayDays: number;
  duplicateSimilarity: number; // percentage 0-100
  duplicateMatchProjectId?: string;
  status: ProjectStatus;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  implementingAgency: string;
  nodalOfficer: string;
  contractorName?: string;
  constituency: string;
  riskFactors: RiskFactorScores;
  aiFindings: string[];
  payments: PaymentRecord[];
  coordinates: { lat: number; lng: number };
  lastUpdated: string;
  structuredFindings?: import('./services/ml/types').AIFinding[];
  shapExplanation?: import('./services/ml/types').ShapExplanation;
  delayPrediction?: import('./services/ml/types').DelayPredictionResult;
  isolationForestScore?: number;
  xgboostRiskProbability?: number;
}

export interface AlertItem {
  id: string;
  projectId: string;
  projectName: string;
  district: MaharashtraDistrict;
  riskType: string;
  severity: RiskLevel;
  detectedDate: string;
  riskScore: number;
  status: 'New' | 'Acknowledged' | 'Under Investigation' | 'Resolved';
  assignedOfficer: string;
  description: string;
}

export type InvestigationStatus = 
  | 'New'
  | 'Assigned'
  | 'In Progress'
  | 'Under Review'
  | 'Clarification Requested'
  | 'Clarification Received'
  | 'Human Review'
  | 'Verified'
  | 'False Positive'
  | 'Further Review Required'
  | 'Escalated'
  | 'Resolved';

export type InvestigationPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface InvestigationNote {
  id: string;
  author: string;
  role: string;
  date: string;
  note: string;
}

export interface ClarificationThread {
  id: string;
  query: string;
  queriedBy: string;
  queryDate: string;
  response?: string;
  respondedBy?: string;
  responseDate?: string;
  supportingDocumentName?: string;
  updatedProgress?: {
    physical: number;
    expenditure: number;
  };
  status: 'Pending' | 'Responded';
}

export interface EvidenceItem {
  id: string;
  title: string;
  uploadedBy: string;
  uploadedDate: string;
  fileType: string;
  size: string;
  verified: boolean;
  notes?: string;
}

export interface InvestigationCase {
  id: string;
  projectId: string;
  projectName: string;
  title?: string;
  district: MaharashtraDistrict;
  riskScore: number;
  riskLevel: RiskLevel;
  assignedTo: string;
  priority: InvestigationPriority;
  createdAt: string;
  dueDate?: string;
  reason?: string;
  status: InvestigationStatus;
  aiFindings: string[];
  notes: InvestigationNote[];
  clarifications: ClarificationThread[];
  evidences: EvidenceItem[];
  resolutionSummary?: string;
  resolvedAt?: string;
  timeline: {
    title: string;
    date: string;
    actor: string;
    description: string;
  }[];
}

export interface DuplicatePair {
  id: string;
  projectAId: string;
  projectBId: string;
  projectAName: string;
  projectBName: string;
  district: MaharashtraDistrict;
  locationSimilarity: number;
  descriptionSimilarity: number;
  costSimilarity: number;
  categorySimilarity: number;
  overallSimilarity: number;
  explanation: string;
  status: 'Pending Review' | 'Potential Duplicate — Verification Required' | 'Verified Independent Scope' | 'Verified Duplicate';
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  district?: MaharashtraDistrict;
  status: 'Active' | 'Inactive';
  lastActive: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  targetPage: string;
  targetProjectId?: string;
  targetCaseId?: string;
}

export interface SystemSettingsConfig {
  riskWeights: RiskWeights;
  thresholds: {
    criticalScore: number; // e.g. 80
    highScore: number; // e.g. 60
    mediumScore: number; // e.g. 40
    costOverrunAlertPercent: number; // e.g. 15%
    delayAlertDays: number; // e.g. 60 days
    duplicateAlertThreshold: number; // e.g. 75%
  };
  notifications: {
    emailAlertsEnabled: boolean;
    smsAlertsCriticalOnly: boolean;
    dailyDigest: boolean;
  };
}

export type {
  AIFinding,
  ModelMetadata,
  ShapExplanation,
  ShapValueItem,
  IsolationForestResult,
  XGBoostRiskResult,
  DelayPredictionResult,
  SemanticMatchResult,
  ComprehensiveAIAnalysis,
} from './services/ml/types';

