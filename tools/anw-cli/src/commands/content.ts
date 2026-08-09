export type ContentOptions = {
  status?: boolean;
  taxonomy?: boolean;
};

type TaxonomySection = {
  name: string;
  values: string[];
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

export function runContent(
  options: ContentOptions = {},
): void {
  const selectedModes =
    [
      options.status,
      options.taxonomy,
    ].filter(Boolean).length;

  if (
    selectedModes > 1
  ) {
    throw new Error(
      "Choose only one content mode: --status or --taxonomy.",
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

  console.log("");

  console.log(
    "No content changes were made.",
  );

  console.log("");
}