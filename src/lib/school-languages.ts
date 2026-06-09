/** Instruction languages offered — stable ids for registration. */
export const INSTRUCTION_LANGUAGE_IDS = [
  'french',
  'english',
  'spanish',
  'german',
  'italian',
  'portuguese',
  'arabic',
  'mandarin',
  'local_languages',
  'dioula',
  'baoule',
  'bete',
] as const;

export type InstructionLanguageId = (typeof INSTRUCTION_LANGUAGE_IDS)[number];

export function getInstructionLanguageOptions(): InstructionLanguageId[] {
  return [...INSTRUCTION_LANGUAGE_IDS];
}

export function instructionLanguageLabelKey(id: InstructionLanguageId): string {
  return `school.lang_${id}`;
}
