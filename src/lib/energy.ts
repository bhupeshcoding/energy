// Energy calculation constants and utilities

export interface EnergyFinding {
  id: string;
  type: 'window' | 'door' | 'appliance' | 'insulation' | 'lighting';
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  title: string;
  description: string;
  estimatedCost: number;
  annualSavings: number;
  paybackPeriod: number;
  location?: string;
  imageUrl?: string;
  
  // Additional properties for reporting
  area?: string;
  issue?: string;
  recommendation?: string;
  confirmed?: boolean;
  userNotes?: string;
  
  // For the PDF report
  areaOfHome?: string;
  specificLocation?: string;
  suggestedAction?: string;
  potentialAnnualSavings?: number;
  estimatedCostRange?: string;
  rebateAvailable?: boolean;
  rebateAmount?: number;
  urgency?: 'immediate' | 'soon' | 'future';
  difficulty?: 'easy' | 'moderate' | 'difficult';
  diyFriendly?: boolean;
  professionalRequired?: boolean;
  estimatedTimeToComplete?: string;
  environmentalImpact?: 'low' | 'medium' | 'high';
  comfortImprovement?: 'low' | 'medium' | 'high';
  healthImpact?: 'low' | 'medium' | 'high';
  safetyConcerns?: string;
  additionalNotes?: string;
  relatedFindings?: string[];
  priority?: number;
  category?: 'heating' | 'cooling' | 'lighting' | 'appliances' | 'building-envelope' | 'renewables' | 'other';
  tags?: string[];
}

// Constants for energy calculations (Australian context)
export const ENERGY_CONSTANTS = {
  electricity: {
    avgRatePerKWh: 0.35, // AUD per kWh (Australian average)
    peakRate: 0.45,
    offPeakRate: 0.25
  },
  gas: {
    avgRatePerMJ: 0.035, // AUD per MJ
  },
  heating: {
    avgAnnualUsage: 4500, // kWh per year for average Australian home
    draftLossPercent: 15
  },
  cooling: {
    avgAnnualUsage: 2800, // kWh per year
    inefficiencyPercent: 20
  },
  lighting: {
    incandescentWatts: 60,
    ledWatts: 9,
    hoursPerDay: 5,
    daysPerYear: 365
  }
};

export function calculateAnnualSavings(finding: EnergyFinding): number {
  const { electricity } = ENERGY_CONSTANTS;
  
  // Calculate savings based on finding type
  if (finding.type === 'window' || finding.type === 'door') {
    // Draft reduction savings
    const heatingLoss = ENERGY_CONSTANTS.heating.avgAnnualUsage * 0.1; // 10% loss through drafts
    return heatingLoss * electricity.avgRatePerKWh;
  }
  
  if (finding.type === 'lighting') {
    // LED conversion savings
    const wattageDiff = ENERGY_CONSTANTS.lighting.incandescentWatts - ENERGY_CONSTANTS.lighting.ledWatts;
    const annualHours = ENERGY_CONSTANTS.lighting.hoursPerDay * ENERGY_CONSTANTS.lighting.daysPerYear;
    const kWhSaved = (wattageDiff * annualHours) / 1000;
    return kWhSaved * electricity.avgRatePerKWh;
  }
  
  if (finding.type === 'appliance') {
    // Old appliance inefficiency
    return ENERGY_CONSTANTS.cooling.avgAnnualUsage * 0.2 * electricity.avgRatePerKWh;
  }
  
  // Default return for other types
  return 0;
}

export function calculatePaybackPeriod(cost: number, annualSavings: number): number {
  if (annualSavings <= 0) return Infinity;
  return Math.round(cost / annualSavings * 10) / 10; // Round to 1 decimal place
}

export function generateFindingId(): string {
  return `finding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}