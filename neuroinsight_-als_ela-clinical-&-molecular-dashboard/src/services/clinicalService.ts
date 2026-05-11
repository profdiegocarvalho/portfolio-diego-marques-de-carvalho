/**
 * Engine de Business Insights Clínicos para ELA (ELA).
 */

export interface ClinicalMeasurement {
  date: Date;
  score: number; // ALSFRS-R (0-48) ou CVF (%)
}

export interface ALSFRS_Question {
  id: number;
  label: string;
  options: { value: number; label: string }[];
}

/**
 * Estrutura oficial do teste ALSFRS-R (12 itens).
 */
export const ALSFRS_R_QUESTIONS: ALSFRS_Question[] = [
  {
    id: 1,
    label: "Fala",
    options: [
      { value: 4, label: "Normal" },
      { value: 3, label: "Distúrbios detectáveis na fala" },
      { value: 2, label: "Inteligível com repetições" },
      { value: 1, label: "Fala combinada com comunicação não verbal" },
      { value: 0, label: "Perda da fala funcional" }
    ]
  },
  {
    id: 2,
    label: "Salivação",
    options: [
      { value: 4, label: "Normal" },
      { value: 3, label: "Leve mas definido excesso de saliva" },
      { value: 2, label: "Moderado excesso de saliva; pode ocorrer sialorreia leve" },
      { value: 1, label: "Marcado excesso de saliva com sialorreia" },
      { value: 0, label: "Sialorreia marcada, exige uso constante de lenços" }
    ]
  },
  {
    id: 3,
    label: "Deglutição",
    options: [
      { value: 4, label: "Hábitos alimentares normais" },
      { value: 3, label: "Problemas precoces na deglutição - engasgos" },
      { value: 2, label: "Consistência da dieta alterada" },
      { value: 1, label: "Necessita de alimentação suplementar (PEG)" },
      { value: 0, label: "Alimentação exclusivamente parenteral ou por sonda" }
    ]
  },
  {
    id: 4,
    label: "Escrita (Caligrafia)",
    options: [
      { value: 4, label: "Normal" },
      { value: 3, label: "Lenta ou desleixada, mas inteligível" },
      { value: 2, label: "Incapaz de escrever algumas palavras" },
      { value: 1, label: "Rabiscos, mas capaz de segurar a caneta" },
      { value: 0, label: "Incapaz de segurar a caneta" }
    ]
  },
  {
    id: 5,
    label: "Cortar Alimentos e Manipular Utensílios",
    options: [
      { value: 4, label: "Normal" },
      { value: 3, label: "Lentidão ou cansaço, sem ajuda externa" },
      { value: 2, label: "Corta a maioria dos alimentos, ajuda necessária em alguns" },
      { value: 1, label: "Alimento cortado por outra pessoa, consegue se alimentar" },
      { value: 0, label: "Precisa ser alimentado" }
    ]
  },
  {
    id: 6,
    label: "Vestuário e Higiene",
    options: [
      { value: 4, label: "Normal" },
      { value: 3, label: "Deficiência leve, sem ajuda" },
      { value: 2, label: "Esforço intermitente ou ajuda necessária" },
      { value: 1, label: "Necessita de ajuda para os cuidados pessoais" },
      { value: 0, label: "Dependência total" }
    ]
  },
  {
    id: 7,
    label: "Virar na Cama e Arrumar Cobertores",
    options: [
      { value: 4, label: "Normal" },
      { value: 3, label: "Lento, mas sem ajuda" },
      { value: 2, label: "Consegue virar, mas com muita dificuldade" },
      { value: 1, label: "Inicia, mas não completa o movimento" },
      { value: 0, label: "Incapaz de realizar" }
    ]
  },
  {
    id: 8,
    label: "Caminhar",
    options: [
      { value: 4, label: "Normal" },
      { value: 3, label: "Dificuldade precoce" },
      { value: 2, label: "Caminha com ajuda" },
      { value: 1, label: "Apenas movimentação não-funcional" },
      { value: 0, label: "Incapaz" }
    ]
  },
  {
    id: 9,
    label: "Subir Escadas",
    options: [
      { value: 4, label: "Normal" },
      { value: 3, label: "Lento" },
      { value: 2, label: "Dificuldade leve" },
      { value: 1, label: "Necessita de assistência" },
      { value: 0, label: "Incapaz" }
    ]
  },
  {
    id: 10,
    label: "Dispneia (Falta de Ar)",
    options: [
      { value: 4, label: "Ausente" },
      { value: 3, label: "Ocorre apenas ao caminhar" },
      { value: 2, label: "Ocorre no repouso" },
      { value: 1, label: "Ocorre ao falar" },
      { value: 0, label: "Grave, exigindo assistência mecânica" }
    ]
  },
  {
    id: 11,
    label: "Ortopneia",
    options: [
      { value: 4, label: "Ausente" },
      { value: 3, label: "Apenas se estiver plano" },
      { value: 2, label: "Necessita de mais de 2 travesseiros" },
      { value: 1, label: "Só dorme sentado" },
      { value: 0, label: "Inapaz de dormir" }
    ]
  },
  {
    id: 12,
    label: "Insuficiência Respiratória",
    options: [
      { value: 4, label: "Nenhuma" },
      { value: 3, label: "Uso intermitente de VNI (ex: BIPAP)" },
      { value: 2, label: "Uso contínuo de VNI" },
      { value: 1, label: "Ventilação invasiva por traqueostomia/tubo" },
      { value: 0, label: "Não aplicável" }
    ]
  }
];

/**
 * Calcula a taxa de declínio (delta pontos/mês).
 * ELA normalmente declina ~1 ponto/mês.
 */
export function calculateDeclineRate(measurements: ClinicalMeasurement[]): number {
  if (measurements.length < 2) return 0;
  
  const sorted = [...measurements].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  
  const deltaScore = first.score - last.score;
  const deltaTimeMonths = (last.date.getTime() - first.date.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  
  if (deltaTimeMonths === 0) return 0;
  return deltaScore / deltaTimeMonths;
}

export function isFccCritical(fvc: number, threshold: number = 50): boolean {
  return fvc < threshold;
}

export function calculateWeightLossPct(initialWeight: number, currentWeight: number): number {
  if (initialWeight === 0) return 0;
  return ((initialWeight - currentWeight) / initialWeight) * 100;
}

export const ALS_PROTEINS = {
  'TDP-43': {
    id: 'P06748',
    significance: 'Ligação de RNA, agregados presentes em 97% dos casos de ELA.'
  },
  'SOD1': {
    id: 'P00441',
    significance: 'Primeiro gene ligado à ELA, via de estresse oxidativo.'
  },
  'FUS': {
    id: 'P35637',
    significance: 'Metabolismo de RNA, ligada à ELA juvenil/agressiva.'
  },
  'C9orf72': {
    id: 'Q96LT7',
    significance: 'Expansão de repetição hexanucleotídica, causa genética comum.'
  }
};
