export const GRADING_SCALE_OPTIONS = [
  { id: '20', label: 'Sur 20 (francophone)' },
  { id: '100', label: 'Sur 100 (pourcentage)' },
  { id: '10', label: 'Sur 10' },
] as const;

export const EVALUATION_TYPE_OPTIONS = [
  { id: 'Devoir', label: 'Devoir' },
  { id: 'Interro', label: 'Interrogation' },
  { id: 'Examen', label: 'Examen' },
  { id: 'Composition', label: 'Composition' },
  { id: 'Contrôle', label: 'Contrôle' },
  { id: 'Projet', label: 'Projet' },
] as const;

export type EvaluationTypeId = (typeof EVALUATION_TYPE_OPTIONS)[number]['id'];
