/** Lycée tracks / séries by education system (registration & settings). */
export const SERIES_BY_SYSTEM: Record<string, readonly string[]> = {
  ivoirien: [
    'A1',
    'A2',
    'B',
    'C',
    'D',
    'E',
    'F1',
    'F2',
    'F3',
    'F4',
    'F7',
    'G1',
    'G2',
    'H1',
    'H2',
    'H3',
  ],
  francais: ['S', 'ES', 'L', 'STI2D', 'STMG', 'ST2S', 'STD2A', 'STAV', 'SLL', 'STHR'],
  anglais: [
    'Sciences',
    'Mathematics',
    'Languages',
    'Humanities',
    'Business & Economics',
    'Arts & Design',
    'Technology',
    'ICT',
  ],
  autre: ['Scientifique', 'Littéraire', 'Économique', 'Technique', 'Professionnel'],
};

export function getSeriesOptionsForSystem(system: string): string[] {
  const key = (system || 'autre').trim().toLowerCase();
  const list = SERIES_BY_SYSTEM[key] ?? SERIES_BY_SYSTEM.autre;
  return [...list];
}

export function filterSeriesForSystem(system: string, selected: string[]): string[] {
  const allowed = new Set(getSeriesOptionsForSystem(system));
  return selected.filter((item) => allowed.has(item));
}
