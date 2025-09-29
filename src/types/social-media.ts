import { Account, Competitor } from '@prisma/client';

export type ThreatLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface BrandVoiceGuardrails {
  tone: string[];
  values: string[];
  personality: string[];
}

export interface CompetitorAngle {
  name: string;
  threatLevel: ThreatLevel;
  differentiator: string;
  recommendedCounter: string;
}

export interface SocialPostSharedBriefing {
  brandSummary: string;
  mustHighlight: string[];
  brandVoiceGuardrails: BrandVoiceGuardrails;
  competitorAngles: CompetitorAngle[];
}

export interface SocialPostVisibilityPlan {
  searchIntent: string;
  llmVisibilityAngles: string[];
  keywordFocus: string[];
  openingHook: string;
  structure: {
    sections: { name: string; purpose: string }[];
  };
  cta: string;
  competitorDifferentiation: string[];
}

export type AccountWithCompetitors = Account & { competitors?: Competitor[] };
