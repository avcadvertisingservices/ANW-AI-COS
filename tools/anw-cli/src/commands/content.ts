export type ContentOptions = {
  status?: boolean;
  taxonomy?: boolean;
  recoveryLibrary?: boolean;
  workflow?: boolean;
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

export function runContent(
  options: ContentOptions = {},
): void {
  const selectedModes =
    [
      options.status,
      options.taxonomy,
      options.recoveryLibrary,
      options.workflow,
    ].filter(Boolean).length;

  if (
    selectedModes > 1
  ) {
    throw new Error(
      "Choose only one content mode: --status, --taxonomy, --recovery-library, or --workflow.",
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

  console.log("");

  console.log(
    "No content changes were made.",
  );

  console.log("");
}