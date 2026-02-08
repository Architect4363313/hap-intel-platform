export interface BusinessMetrics {
  reputation: number; // 0-100
  visibility: number; // 0-100
  quality: number; // 0-100
  price: number; // 0-100
}

export interface BusinessSource {
  title: string;
  uri: string;
}

export interface DecisionMaker {
  name: string;
  role: string;
  validation: 'ALTO' | 'MEDIO' | 'BAJO';
  source?: string;
}

export interface TechStack {
  name: string;
  category: 'RESERVAS' | 'DELIVERY' | 'TPV' | 'PAGOS' | 'OTRO';
}

export interface EmailVector {
  email: string;
  type: 'INFERIDO' | 'VERIFICADO' | 'PÚBLICO';
  risk: 'BAJO' | 'MEDIO' | 'ALTO';
}

export interface ConversationStarter {
  headline: string;
  context: string;
  date?: string;
}

export interface OutreachVariant {
  type: string; // Changed from enum to string to be more permissive
  subject: string;
  body: string;
}

export interface BusinessProfile {
  businessName: string;
  city: string;
  summary: string;
  score: number; // Honei Score
  metrics: BusinessMetrics;
  
  // Operational Attributes
  attributes: {
    terrace: boolean;
    reservations: boolean;
    cardType: string; // e.g. "AMEX", "VISA"
  };

  // Tech Stack
  techStack: TechStack[];
  potentialIntegration: boolean;

  // Decision Makers (CFO/CEO)
  decisionMakers: DecisionMaker[];

  // Deep Analysis (Perplexity Style)
  deepAnalysis: {
    summary: string;
    sources: string[];
  };

  // Contact Info & Vectors
  contact: {
    address?: string;
    website?: string;
    phone?: string;
    phoneSource?: string; // Where the phone was found
    uberEatsUrl?: string; // New field for Uber Eats link
    domain?: string;
    osintNotes?: string;
  };
  emailVectors: EmailVector[];

  // Draft Emails (Multiple Variations)
  // Supports both array (new) and object (legacy) for runtime compatibility
  outreach: OutreachVariant[] | any; 

  // News / Icebreakers
  conversationStarters: ConversationStarter[];

  priceLevel: string;
  cuisineType: string;
  googleSearchSources?: BusinessSource[];

// Email Verification Types
  export interface EmailVerificationResult {
    email: string;
      verified: boolean;
      status: 'DELIVERABLE' | 'UNDELIVERABLE' | 'RISKY' | 'UNKNOWN';
      statusDetail: string;
  }

  export interface EmailVerificationState {
    [email: string]: 'idle' | 'loading' | 'verified' | 'unverified' | 'error';
  }
}
