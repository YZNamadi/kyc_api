export interface ScoringRule {
  weight: number;
  threshold: number;
}

export interface RiskScoringConfig {
  rules: {
    fullNameMatch: ScoringRule;
    dobMatch: ScoringRule;
    ninMatch: ScoringRule;
    bvnMatch: ScoringRule;
    emailMatch: ScoringRule;
  };
  thresholds: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
  };
}

export const riskScoringConfig: RiskScoringConfig = {
  rules: {
    fullNameMatch: {
      weight: 10,
      threshold: 0.8, // 80% match required
    },
    dobMatch: {
      weight: 10,
      threshold: 1.0, // Exact match required
    },
    ninMatch: {
      weight: 15,
      threshold: 1.0, // Exact match required
    },
    bvnMatch: {
      weight: 15,
      threshold: 1.0, // Exact match required
    },
    emailMatch: {
      weight: 10,
      threshold: 1.0, // Exact match required
    },
  },
  thresholds: {
    LOW: 70, // Score >= 70 is LOW risk
    MEDIUM: 40, // Score >= 40 is MEDIUM risk
    HIGH: 0, // Score < 40 is HIGH risk
  },
}; 