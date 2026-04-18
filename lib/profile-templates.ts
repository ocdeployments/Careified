interface ProfileData {
  scenarios?: {
    patience?: 'A' | 'B';
    empathy?: 'A' | 'B';
    adaptability?: 'A' | 'B';
    communication?: 'A' | 'B';
    emotional_regulation?: 'A' | 'B';
    problem_solving?: 'A' | 'B';
    resilience?: 'A' | 'B';
  };
  specializations?: string[];
  yearsExperience?: number;
  jobTitle?: string;
  certifications?: Array<{ name?: string }>;
}

export function generateWorkingStyle(profile: ProfileData): string {
  const { scenarios = {}, specializations = [], yearsExperience = 0 } = profile;

  const templates = {
    patience: {
      A: "approach each interaction with natural ease, staying present even with repetition",
      B: "maintain professional composure and find calm through structured routines"
    },
    empathy: {
      A: "proactively check in on emotional needs and name what I observe",
      B: "stay observant and respond thoughtfully when I sense distress"
    },
    adaptability: {
      A: "adapt quickly when care plans change, working with new information seamlessly",
      B: "follow protocols carefully and confirm changes with the care team before adjusting"
    },
    communication: {
      A: "communicate observations promptly, often reaching out same-day",
      B: "document thoroughly and report during scheduled check-ins"
    },
    emotional_regulation: {
      A: "stay calm in tense moments and explain my reasoning clearly",
      B: "remain professional in the moment and process challenging interactions afterward"
    },
    problem_solving: {
      A: "try different approaches until I find what works for each client",
      B: "collaborate with families and agencies to solve challenges together"
    },
    resilience: {
      A: "form meaningful connections and may stay in touch with families after placements end",
      B: "process each experience thoughtfully and close chapters with intention"
    }
  };

  const intro = templates.patience[scenarios.patience || 'A'];
  const empathy = templates.empathy[scenarios.empathy || 'A'];
  const adaptability = templates.adaptability[scenarios.adaptability || 'A'];
  
  const specialtyText = specializations.length > 0 
    ? "specializing in " + specializations.slice(0, 2).join(' and ')
    : 'providing compassionate care';

  return "I " + intro + ". I " + empathy + ", and I " + adaptability + ". With " + yearsExperience + " years " + specialtyText + ", I've learned that genuine care means showing up consistently and treating each client with dignity. My approach centers on partnership-with clients, families, and care teams-to create the best possible outcomes.";
}

export function generateBio(profile: ProfileData): string {
  const jobTitle = profile.jobTitle || 'Caregiver';
  const specializations = profile.specializations || [];
  const yearsExperience = profile.yearsExperience || 0;
  const certifications = profile.certifications || [];

  let certText = '';
  if (certifications.length > 0) {
    certText = " I hold " + (certifications[0]?.name || 'professional certifications') + " and continuously invest in my skills.";
  }

  let specialtyText = '';
  if (specializations.length > 0) {
    specialtyText = " specializing in " + specializations.slice(0, 3).join(', ');
  }

  return jobTitle + " with " + yearsExperience + "+ years of experience" + specialtyText + ". I believe every client deserves personalized attention, dignity, and compassionate care that honors their unique needs and preferences." + certText + " I approach my work with patience, empathy, and a commitment to building trust with both clients and their families.";
}

export function generateOpenQuestion(questionType: string, profile: ProfileData): string {
  const specializations = profile.specializations || [];
  const yearsExperience = profile.yearsExperience || 0;
  const certifications = profile.certifications || [];

  const templates: Record<string, string> = {
    motivation: "After " + yearsExperience + " years in care, what keeps me going is seeing families find peace knowing their loved one is in capable, caring hands. " + (specializations.length > 0 ? "My focus on " + specializations[0] + " has taught me that" : "I've learned that") + " small moments of connection and dignity matter more than any task list.",
    
    strength: "My greatest strength is my ability to stay calm and adapt in challenging situations. " + (certifications.length > 0 ? "My " + (certifications[0]?.name || 'training') + " gave me tools," : "My experience has taught me") + " but working with diverse clients taught me that flexibility and genuine empathy create the best outcomes.",
    
    approach: "I believe the best care happens when clients feel heard and respected. I take time to learn each person's preferences, communication style, and what brings them comfort. " + (specializations.length > 0 ? "In my work with " + specializations[0] + ", this personalized approach" : "This approach") + " has helped me build trust and provide care that truly supports each individual's quality of life."
  };

  return templates[questionType] || templates.motivation;
}
