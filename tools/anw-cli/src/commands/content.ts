export type ContentOptions = {
  status?: boolean;
  taxonomy?: boolean;
  recoveryLibrary?: boolean;
  workflow?: boolean;
  brandRules?: boolean;
  websiteContract?: boolean;
};

type TaxonomySection = {
  name: string;
  values: string[];
};

type RecoveryLibrarySection = {
  name: string;
  purpose: string;
};

type WorkflowState = {
  name: string;
  purpose: string;
  next: string[];
};

type BrandRuleSection = {
  name: string;
  rules: string[];
};

type WebsiteContractField = {
  name: string;
  required: boolean;
  purpose: string;
};

type WebsiteContractRule = {
  name: string;
  rule: string;
};

const CONTENT_RECORD_FIELDS = [
  "Content ID",
  "Title",
  "Journey Stage",
  "Audience",
  "Content Pillar",
  "Topic",
  "Format",
  "Platform",
  "Status",
  "CTA",
  "Source Type",
  "Medical Review Level",
  "Created At",
  "Updated At",
];

const CONTENT_TAXONOMY: TaxonomySection[] = [
  {
    name: "Journey Stage",
    values: [
      "Symptoms",
      "Diagnosis",
      "Watch & Wait",
      "Surgery",
      "Radiation",
      "Recovery",
      "Life After Treatment",
    ],
  },
  {
    name: "Audience",
    values: [
      "Patient",
      "Caregiver",
      "Family",
      "Newly Diagnosed",
      "Watch & Wait",
      "Post-Op",
      "Radiation Patient",
      "Brain Surgery Survivor",
    ],
  },
  {
    name: "Content Pillar",
    values: [
      "Relatable Recovery",
      "Education",
      "Documentary Journey",
      "Hope",
      "Advocacy",
      "Community",
    ],
  },
  {
    name: "Format",
    values: [
      "Reel",
      "Carousel",
      "Facebook Post",
      "Instagram Post",
      "YouTube Video",
      "Short Video",
      "Blog",
      "Email",
      "Printable",
      "Guide",
    ],
  },
  {
    name: "Platform",
    values: [
      "Facebook",
      "Instagram",
      "YouTube",
      "Website",
      "Email",
      "Print",
    ],
  },
  {
    name: "Status",
    values: [
      "IDEA",
      "DRAFT",
      "REVIEW",
      "APPROVED",
      "SCHEDULED",
      "PUBLISHED",
      "ARCHIVED",
    ],
  },
  {
    name: "CTA",
    values: [
      "Start Here",
      "Read More",
      "Watch",
      "Save",
      "Share",
      "Comment",
      "Follow",
      "Subscribe",
      "Download Starter Guide",
      "Visit Recovery Library",
      "Join Community",
    ],
  },
  {
    name: "Source Type",
    values: [
      "Survivor Experience",
      "Medical Education",
      "Community Question",
      "Community Story",
      "Expert Source",
      "Research",
      "ANW Original",
    ],
  },
  {
    name: "Medical Review Level",
    values: [
      "NONE",
      "BASIC",
      "ELEVATED",
      "REQUIRED",
    ],
  },
];

const RECOVERY_LIBRARY: RecoveryLibrarySection[] = [
  {
    name: "Symptoms",
    purpose:
      "Early and ongoing Acoustic Neuroma symptoms, warning signs, lived experiences, and symptom education.",
  },
  {
    name: "Diagnosis",
    purpose:
      "MRI, hearing tests, consultations, diagnosis questions, and support for newly diagnosed warriors.",
  },
  {
    name: "Watch & Wait",
    purpose:
      "Monitoring, follow-up imaging, tumor growth discussions, scanxiety, and living with active surveillance.",
  },
  {
    name: "Surgery",
    purpose:
      "Preparing for surgery, surgical approaches, hospital experience, questions for the care team, and post-operative guidance.",
  },
  {
    name: "Radiation",
    purpose:
      "Radiation treatment education, preparation, recovery, monitoring, and patient experiences.",
  },
  {
    name: "Recovery",
    purpose:
      "General recovery after treatment, healing milestones, daily challenges, rehabilitation, and realistic expectations.",
  },
  {
    name: "Hearing",
    purpose:
      "One-sided hearing loss, tinnitus, hearing rehabilitation, CROS and other hearing-support topics.",
  },
  {
    name: "Balance",
    purpose:
      "Dizziness, vertigo, vestibular rehabilitation, walking confidence, and balance recovery.",
  },
  {
    name: "Facial Nerve Recovery",
    purpose:
      "Facial weakness, facial paralysis recovery, nerve healing, rehabilitation, and practical support.",
  },
  {
    name: "Eye Care",
    purpose:
      "Eye closure, dryness, protection, lubrication, and eye-care needs related to facial nerve weakness.",
  },
  {
    name: "Fatigue",
    purpose:
      "Post-treatment fatigue, pacing, rest, energy management, and invisible recovery challenges.",
  },
  {
    name: "Brain Fog",
    purpose:
      "Memory, concentration, word-finding, multitasking, cognitive fatigue, and daily coping strategies.",
  },
  {
    name: "Mental Health",
    purpose:
      "Scanxiety, fear, grief, emotional recovery, uncertainty, resilience, and mental wellbeing.",
  },
  {
    name: "Caregivers",
    purpose:
      "Practical and emotional support for caregivers, family members, spouses, and loved ones.",
  },
  {
    name: "Life After Treatment",
    purpose:
      "Long-term recovery, returning to work and family life, identity, adaptation, follow-up, and survivorship.",
  },
  {
    name: "Hope",
    purpose:
      "Encouragement, survivor milestones, community stories, faith, gratitude, and realistic hope.",
  },
];

const CONTENT_WORKFLOW: WorkflowState[] = [
  {
    name: "IDEA",
    purpose:
      "A content concept has been captured but has not yet been developed.",
    next: [
      "DRAFT",
      "ARCHIVED",
    ],
  },
  {
    name: "DRAFT",
    purpose:
      "The content is being written, designed, scripted, or assembled.",
    next: [
      "REVIEW",
      "ARCHIVED",
    ],
  },
  {
    name: "REVIEW",
    purpose:
      "The content is undergoing human quality, brand, factual, and safety review.",
    next: [
      "DRAFT",
      "APPROVED",
      "ARCHIVED",
    ],
  },
  {
    name: "APPROVED",
    purpose:
      "The content has passed human review and is permitted to enter the publishing workflow.",
    next: [
      "SCHEDULED",
      "DRAFT",
      "ARCHIVED",
    ],
  },
  {
    name: "SCHEDULED",
    purpose:
      "The content is approved and scheduled for publication on one or more platforms.",
    next: [
      "PUBLISHED",
      "APPROVED",
      "ARCHIVED",
    ],
  },
  {
    name: "PUBLISHED",
    purpose:
      "The content has been published and may now contribute performance data to the learning system.",
    next: [
      "ARCHIVED",
    ],
  },
  {
    name: "ARCHIVED",
    purpose:
      "The content remains part of ANW history but is no longer active in the publishing workflow.",
    next: [],
  },
];

const BRAND_AND_SAFETY_RULES: BrandRuleSection[] = [
  {
    name: "Mission",
    rules: [
      "Help Acoustic Neuroma patients, survivors, caregivers, and families feel informed, supported, and less alone.",
      "Create content that is compassionate, useful, understandable, and grounded in the real patient journey.",
      "Support education and advocacy without replacing professional medical care.",
    ],
  },
  {
    name: "Brand Voice",
    rules: [
      "Use a compassionate, calm, respectful, survivor-led voice.",
      "Write in clear patient-friendly language and explain medical terminology when it is necessary.",
      "Speak with empathy without being patronizing, dramatic, or fear-based.",
      "Use realistic hope rather than promises, guarantees, or exaggerated outcomes.",
      "Preserve the ANW message: You Are Not Alone.",
    ],
  },
  {
    name: "Survivor Experience",
    rules: [
      "Clearly distinguish personal survivor experience from general medical information.",
      "Do not present one person's outcome as the expected outcome for every patient.",
      "Respect that treatment decisions, symptoms, recovery timelines, and outcomes differ between people.",
      "Community stories must preserve dignity and should not be presented as clinical evidence.",
    ],
  },
  {
    name: "Medical Safety",
    rules: [
      "Do not diagnose a person from symptoms, comments, images, stories, or social media information.",
      "Do not guarantee that a treatment, surgery, radiation approach, medicine, exercise, supplement, or recovery technique will work.",
      "Do not tell people to stop, start, replace, or change prescribed medical treatment without appropriate professional guidance.",
      "Avoid definitive claims when evidence, individual circumstances, or medical evaluation may change the answer.",
      "Encourage appropriate professional medical evaluation when content involves diagnosis, treatment decisions, new neurological symptoms, emergencies, or significant changes in condition.",
    ],
  },
  {
    name: "Medical Review Levels",
    rules: [
      "NONE may be used for clearly non-medical community, encouragement, storytelling, and general brand content.",
      "BASIC requires factual and wording review before approval.",
      "ELEVATED requires stronger source verification and human review before approval.",
      "REQUIRED must not be approved for publishing until appropriate medical or expert review requirements have been satisfied.",
      "Medical review level does not remove the requirement for human approval before publishing.",
    ],
  },
  {
    name: "Human Approval",
    rules: [
      "No content may enter automated publishing unless its workflow status is APPROVED.",
      "Human review must consider accuracy, safety, tone, privacy, brand alignment, and platform suitability.",
      "Automation may assist with drafting, formatting, scheduling, repurposing, and analytics but must not bypass the approval gate.",
      "Content requiring correction must return to DRAFT or REVIEW before being approved again.",
    ],
  },
  {
    name: "Evidence and Sources",
    rules: [
      "Separate survivor experience, community discussion, expert information, research, and ANW original education using the Source Type field.",
      "Medical or scientific claims should use trustworthy sources appropriate to the importance of the claim.",
      "Do not fabricate studies, statistics, quotations, medical recommendations, or expert statements.",
      "When uncertainty exists, communicate the uncertainty rather than presenting assumptions as established facts.",
    ],
  },
  {
    name: "Patient-Friendly Communication",
    rules: [
      "Avoid unnecessary alarm, catastrophic framing, and sensational medical language.",
      "Do not use fear as a tactic to increase clicks, comments, shares, or watch time.",
      "Use strong hooks only when they remain accurate and respectful.",
      "Make educational content easy to scan, understand, save, and discuss with a healthcare professional.",
    ],
  },
  {
    name: "Privacy and Community Safety",
    rules: [
      "Do not expose private patient information without appropriate permission.",
      "Avoid publishing identifying medical details from community members unless they knowingly provided them for that purpose.",
      "Handle sensitive stories, diagnoses, images, caregiver experiences, and recovery challenges with dignity.",
      "Do not shame people for choosing surgery, radiation, watch and wait, rehabilitation, hearing devices, mental health support, or other legitimate care pathways.",
    ],
  },
  {
    name: "Calls to Action",
    rules: [
      "Use calls to action that support education, community, recovery resources, and informed discussion.",
      "Do not use deceptive urgency or exploit fear, illness, disability, or uncertainty to drive engagement or sales.",
      "Keep promotional language secondary to patient value and trust.",
      "Approved CTA values should remain consistent with the ANW content taxonomy.",
    ],
  },
  {
    name: "Visual Identity",
    rules: [
      "Keep ANW branding consistent across website, social media, printables, guides, and video assets.",
      "Favor calm, readable, accessible layouts suitable for patients who may experience fatigue, visual sensitivity, or cognitive overload.",
      "Use the official ANW logo consistently and avoid visual treatments that reduce readability or trust.",
      "Medical diagrams, illustrations, and generated visuals must not imply diagnostic certainty when they are educational or illustrative only.",
    ],
  },
  {
    name: "Publishing Principle",
    rules: [
      "Patient trust is more important than reach, virality, speed, or monetization.",
      "Accuracy and safety are more important than publishing volume.",
      "Every published asset should help the audience feel seen, understand something useful, navigate their journey, or connect with community.",
    ],
  },
];

const WEBSITE_CONTRACT_FIELDS: WebsiteContractField[] = [
  {
    name: "Content ID",
    required: true,
    purpose:
      "Stable unique identifier shared between ANW AI-COS and the website.",
  },
  {
    name: "Page Type",
    required: true,
    purpose:
      "Identifies how the website should render the content, such as article, Recovery Library entry, guide, landing page, or story.",
  },
  {
    name: "Title",
    required: true,
    purpose:
      "Human-readable public title of the website content.",
  },
  {
    name: "Slug",
    required: true,
    purpose:
      "Stable URL-safe identifier used to construct the public website path.",
  },
  {
    name: "Journey Stage",
    required: true,
    purpose:
      "Connects website content to the canonical ANW patient journey taxonomy.",
  },
  {
    name: "Recovery Library Section",
    required: false,
    purpose:
      "Maps content to a canonical Recovery Library section when applicable.",
  },
  {
    name: "Audience",
    required: true,
    purpose:
      "Identifies the primary audience using the ANW content taxonomy.",
  },
  {
    name: "Content Pillar",
    required: true,
    purpose:
      "Identifies the strategic ANW content pillar represented by the page.",
  },
  {
    name: "Summary",
    required: true,
    purpose:
      "Short patient-friendly summary for cards, listings, previews, and introductions.",
  },
  {
    name: "Body",
    required: true,
    purpose:
      "Primary website content body or canonical structured content payload.",
  },
  {
    name: "CTA",
    required: false,
    purpose:
      "Approved ANW call to action associated with the content.",
  },
  {
    name: "Source Type",
    required: true,
    purpose:
      "Identifies whether the content is survivor experience, medical education, community content, expert material, research, or ANW original.",
  },
  {
    name: "Medical Review Level",
    required: true,
    purpose:
      "Defines the review requirement that must be satisfied before publication.",
  },
  {
    name: "Status",
    required: true,
    purpose:
      "Tracks the content through the canonical ANW workflow.",
  },
  {
    name: "Publishable",
    required: true,
    purpose:
      "Explicit website publishing gate derived from approval and review requirements.",
  },
  {
    name: "SEO Title",
    required: false,
    purpose:
      "Search-friendly page title that remains accurate and consistent with the content.",
  },
  {
    name: "SEO Description",
    required: false,
    purpose:
      "Patient-friendly search description that accurately summarizes the page.",
  },
  {
    name: "Featured Media",
    required: false,
    purpose:
      "Reference or identifier for the primary image, video, or other website media asset.",
  },
  {
    name: "Canonical URL",
    required: false,
    purpose:
      "Preferred canonical public URL when the content is published.",
  },
  {
    name: "Created At",
    required: true,
    purpose:
      "Timestamp recording when the canonical content record was created.",
  },
  {
    name: "Updated At",
    required: true,
    purpose:
      "Timestamp recording the latest canonical content update.",
  },
];

const WEBSITE_CONTRACT_RULES: WebsiteContractRule[] = [
  {
    name: "Approval Gate",
    rule:
      "Only content with Status APPROVED or a later valid publishing state may be considered for website publication.",
  },
  {
    name: "Publishable Gate",
    rule:
      "Publishable must be YES only when human approval and all applicable medical review requirements have been satisfied.",
  },
  {
    name: "Taxonomy",
    rule:
      "Journey Stage, Audience, Content Pillar, CTA, Source Type, Medical Review Level, and Status must conform to the canonical ANW taxonomy.",
  },
  {
    name: "Recovery Library",
    rule:
      "Recovery Library Section must match a canonical Recovery Library section whenever the content is part of the Recovery Library.",
  },
  {
    name: "Stable Identity",
    rule:
      "Content ID must remain stable across edits, publishing operations, analytics, and website synchronization.",
  },
  {
    name: "Stable Slug",
    rule:
      "Slug should remain stable after publication unless a deliberate redirect or migration strategy is used.",
  },
  {
    name: "URL Safety",
    rule:
      "Slug must be URL-safe and should use lowercase words separated by hyphens.",
  },
  {
    name: "SEO Accuracy",
    rule:
      "SEO Title and SEO Description must accurately represent the page and must not introduce unsupported medical claims.",
  },
  {
    name: "Medical Safety",
    rule:
      "Website publication must not bypass the ANW Brand + Safety Rules or required medical review.",
  },
  {
    name: "Media References",
    rule:
      "Featured Media should use a stable external reference, asset identifier, or managed URL rather than embedding binary media inside the content record.",
  },
  {
    name: "Canonical Ownership",
    rule:
      "ANW AI-COS remains the canonical content authority while the website acts as a publishing and presentation destination.",
  },
  {
    name: "Synchronization",
    rule:
      "Website integrations should use Content ID and Updated At to detect and synchronize changed canonical records safely.",
  },
];

export function runContent(
  options: ContentOptions = {},
): void {
  const selectedModes = [
    options.status,
    options.taxonomy,
    options.recoveryLibrary,
    options.workflow,
    options.brandRules,
    options.websiteContract,
  ].filter(Boolean).length;

  if (
    selectedModes > 1
  ) {
    throw new Error(
      "Choose only one content mode: --status, --taxonomy, --recovery-library, --workflow, --brand-rules, or --website-contract.",
    );
  }

  if (
    options.status === true
  ) {
    runContentStatus();
    return;
  }

  if (
    options.taxonomy === true
  ) {
    runContentTaxonomy();
    return;
  }

  if (
    options.recoveryLibrary === true
  ) {
    runRecoveryLibrary();
    return;
  }

  if (
    options.workflow === true
  ) {
    runContentWorkflow();
    return;
  }

  if (
    options.brandRules === true
  ) {
    runBrandRules();
    return;
  }

  if (
    options.websiteContract === true
  ) {
    runWebsiteContract();
    return;
  }

  printContentHelp();
}

function runContentStatus(): void {
  console.log("");

  console.log(
    "# ANW AI-COS Content Status",
  );

  console.log("");

  console.log(
    "Content system: ACTIVE",
  );

  console.log(
    "Brand: Acoustic Neuroma Warrior",
  );

  console.log(
    "Content framework: Recovery Library",
  );

  console.log(
    "Story framework: Recovery Cinematic Universe",
  );

  console.log(
    "Publishing model: Human approval required",
  );

  console.log(
    "Automation readiness: READY",
  );

  console.log("");

  console.log(
    "Content system inspection complete.",
  );

  console.log(
    "No files were changed.",
  );

  console.log("");
}

function runContentTaxonomy(): void {
  console.log("");

  console.log(
    "# ANW AI-COS Content Taxonomy",
  );

  console.log("");

  console.log(
    "Canonical content record fields:",
  );

  console.log("");

  for (
    const field
    of CONTENT_RECORD_FIELDS
  ) {
    console.log(
      `- ${field}`,
    );
  }

  console.log("");

  for (
    const section
    of CONTENT_TAXONOMY
  ) {
    console.log(
      `## ${section.name}`,
    );

    console.log("");

    for (
      const value
      of section.values
    ) {
      console.log(
        `- ${value}`,
      );
    }

    console.log("");
  }

  console.log(
    "Content taxonomy inspection complete.",
  );

  console.log(
    "No files were changed.",
  );

  console.log("");
}

function runRecoveryLibrary(): void {
  console.log("");

  console.log(
    "# ANW AI-COS Recovery Library",
  );

  console.log("");

  console.log(
    `Sections: ${RECOVERY_LIBRARY.length}`,
  );

  console.log("");

  RECOVERY_LIBRARY.forEach(
    (
      section,
      index,
    ) => {
      console.log(
        `${index + 1}. ${section.name}`,
      );

      console.log(
        `   ${section.purpose}`,
      );

      console.log("");
    },
  );

  console.log(
    "Recovery Library registry inspection complete.",
  );

  console.log(
    "No files were changed.",
  );

  console.log("");
}

function runContentWorkflow(): void {
  console.log("");

  console.log(
    "# ANW AI-COS Content Workflow",
  );

  console.log("");

  console.log(
    `Workflow states: ${CONTENT_WORKFLOW.length}`,
  );

  console.log("");

  console.log(
    "Publishing gate: APPROVED",
  );

  console.log(
    "Human approval required: YES",
  );

  console.log("");

  CONTENT_WORKFLOW.forEach(
    (
      state,
      index,
    ) => {
      console.log(
        `${index + 1}. ${state.name}`,
      );

      console.log(
        `   Purpose: ${state.purpose}`,
      );

      console.log(
        `   Next: ${
          state.next.length > 0
            ? state.next.join(", ")
            : "NONE"
        }`,
      );

      console.log("");
    },
  );

  console.log(
    "Workflow:",
  );

  console.log("");

  console.log(
    "IDEA -> DRAFT -> REVIEW -> APPROVED -> SCHEDULED -> PUBLISHED -> ARCHIVED",
  );

  console.log("");

  console.log(
    "Automation rule:",
  );

  console.log(
    "Only APPROVED content may proceed toward automated publishing.",
  );

  console.log("");

  console.log(
    "Content workflow inspection complete.",
  );

  console.log(
    "No files were changed.",
  );

  console.log("");
}

function runBrandRules(): void {
  console.log("");

  console.log(
    "# ANW AI-COS Brand + Safety Rules",
  );

  console.log("");

  console.log(
    `Rule sections: ${BRAND_AND_SAFETY_RULES.length}`,
  );

  console.log("");

  console.log(
    "Core principle:",
  );

  console.log(
    "Patient trust is more important than reach, virality, speed, or monetization.",
  );

  console.log("");

  console.log(
    "Publishing gate: HUMAN APPROVAL REQUIRED",
  );

  console.log("");

  BRAND_AND_SAFETY_RULES.forEach(
    (
      section,
      index,
    ) => {
      console.log(
        `${index + 1}. ${section.name}`,
      );

      for (
        const rule
        of section.rules
      ) {
        console.log(
          `   - ${rule}`,
        );
      }

      console.log("");
    },
  );

  console.log(
    "Brand and safety rules inspection complete.",
  );

  console.log(
    "No files were changed.",
  );

  console.log("");
}

function runWebsiteContract(): void {
  console.log("");

  console.log(
    "# ANW AI-COS Website Integration Contract",
  );

  console.log("");

  console.log(
    "Contract version: 1.0",
  );

  console.log(
    "Canonical authority: ANW AI-COS",
  );

  console.log(
    "Publishing destination: ANW Website",
  );

  console.log(
    "Human approval required: YES",
  );

  console.log("");

  console.log(
    `Contract fields: ${WEBSITE_CONTRACT_FIELDS.length}`,
  );

  console.log("");

  WEBSITE_CONTRACT_FIELDS.forEach(
    (
      field,
      index,
    ) => {
      console.log(
        `${index + 1}. ${field.name}`,
      );

      console.log(
        `   Required: ${field.required ? "YES" : "NO"}`,
      );

      console.log(
        `   Purpose: ${field.purpose}`,
      );

      console.log("");
    },
  );

  console.log(
    `Integration rules: ${WEBSITE_CONTRACT_RULES.length}`,
  );

  console.log("");

  WEBSITE_CONTRACT_RULES.forEach(
    (
      contractRule,
      index,
    ) => {
      console.log(
        `${index + 1}. ${contractRule.name}`,
      );

      console.log(
        `   ${contractRule.rule}`,
      );

      console.log("");
    },
  );

  console.log(
    "Website publishing rule:",
  );

  console.log("");

  console.log(
    "APPROVED + review requirements satisfied -> Publishable YES -> Website synchronization allowed",
  );

  console.log("");

  console.log(
    "Website integration contract inspection complete.",
  );

  console.log(
    "No files were changed.",
  );

  console.log("");
}

function printContentHelp(): void {
  console.log("");

  console.log(
    "# ANW AI-COS Content",
  );

  console.log("");

  console.log(
    "Available commands:",
  );

  console.log("");

  console.log(
    "npm run dev -- content --status",
  );

  console.log(
    "npm run dev -- content --taxonomy",
  );

  console.log(
    "npm run dev -- content --recovery-library",
  );

  console.log(
    "npm run dev -- content --workflow",
  );

  console.log(
    "npm run dev -- content --brand-rules",
  );

  console.log(
    "npm run dev -- content --website-contract",
  );

  console.log("");

  console.log(
    "No content changes were made.",
  );

  console.log("");
}