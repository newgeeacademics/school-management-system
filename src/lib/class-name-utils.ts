export function classNameSlug(name: string): string {
  const cleaned = name.replace(/[^A-Za-z0-9]/g, '');
  if (!cleaned) return 'GEN';
  return cleaned.length > 6 ? cleaned.slice(0, 6) : cleaned;
}

function isClassNameAvailable(
  candidate: string,
  existingNames: string[],
  existingSlugs: Set<string>
): boolean {
  const normalized = candidate.trim().toLowerCase();
  if (!normalized) return false;
  if (existingNames.some((name) => name.trim().toLowerCase() === normalized)) {
    return false;
  }
  return !existingSlugs.has(classNameSlug(candidate).toLowerCase());
}

/** Ensures a unique class label (e.g. "4ème A" → "4ème A1" when "4ème A" already exists). */
export function ensureUniqueClassName(requestedName: string, existingNames: string[]): string {
  const trimmed = requestedName.trim();
  if (!trimmed) return trimmed;

  const slugs = new Set(existingNames.map((name) => classNameSlug(name).toLowerCase()));
  if (isClassNameAvailable(trimmed, existingNames, slugs)) {
    return trimmed;
  }

  for (let n = 1; n <= 999; n += 1) {
    const candidate = `${trimmed}${n}`;
    if (isClassNameAvailable(candidate, existingNames, slugs)) {
      return candidate;
    }
  }

  return trimmed;
}

export function buildClassNameOptions(level: string, existingNames: string[]): string[] {
  if (!level.trim()) return [];
  return ['A', 'B', 'C', 'D', 'E'].map((letter) =>
    ensureUniqueClassName(`${level} ${letter}`, existingNames)
  );
}
