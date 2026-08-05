import {
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";

import {
  join,
  resolve,
} from "node:path";

type CreateComponentOptions = {
  force?: boolean;
};

export function createComponent(
  rawName: string,
  options: CreateComponentOptions = {},
): void {
  const componentName =
    toPascalCase(rawName);

  if (!componentName) {
    throw new Error(
      "A valid component name is required.",
    );
  }

  const projectRoot =
    findProjectRoot(process.cwd());

  const componentsRoot = join(
    projectRoot,
    "apps",
    "admin",
    "src",
    "components",
  );

  const componentPath = join(
    componentsRoot,
    `${componentName}.tsx`,
  );

  if (
    existsSync(componentPath) &&
    !options.force
  ) {
    throw new Error(
      `Component already exists: ${componentPath}`,
    );
  }

  mkdirSync(componentsRoot, {
    recursive: true,
  });

  writeFileSync(
    componentPath,
    createComponentCode(componentName),
    "utf8",
  );

  console.log("");
  console.log(
    "ANW component created successfully.",
  );
  console.log("");
  console.log(`Name: ${componentName}`);
  console.log(
    `Path: apps/admin/src/components/${componentName}.tsx`,
  );
  console.log("");
}

function findProjectRoot(
  startDirectory: string,
): string {
  let currentDirectory =
    resolve(startDirectory);

  while (true) {
    const adminComponentsPath = join(
      currentDirectory,
      "apps",
      "admin",
      "src",
      "components",
    );

    if (
      existsSync(adminComponentsPath)
    ) {
      return currentDirectory;
    }

    const parentDirectory = resolve(
      currentDirectory,
      "..",
    );

    if (
      parentDirectory ===
      currentDirectory
    ) {
      break;
    }

    currentDirectory =
      parentDirectory;
  }

  throw new Error(
    "ANW project root could not be found. Run the command from inside the ANW-AI-COS repository.",
  );
}

function toPascalCase(
  value: string,
): string {
  return value
    .trim()
    .replace(
      /([a-z0-9])([A-Z])/g,
      "$1 $2",
    )
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1).toLowerCase(),
    )
    .join("");
}

function createComponentCode(
  componentName: string,
): string {
  return `type ${componentName}Props = {
  className?: string;
};

export default function ${componentName}({
  className = "",
}: ${componentName}Props) {
  return (
    <section
      className={[
        "rounded-3xl",
        "border",
        "border-emerald-950/10",
        "bg-white",
        "p-6",
        "shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#176b52]">
        ANW AI-COS
      </p>

      <h2 className="mt-2 text-xl font-bold text-slate-900">
        ${componentName}
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        Replace this placeholder with the component content.
      </p>
    </section>
  );
}
`;
}