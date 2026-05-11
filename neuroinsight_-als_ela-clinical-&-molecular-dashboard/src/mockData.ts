import { ClinicalMeasurement } from './services/clinicalService';

export const MOCK_PATIENTS = [
  {
    id: 'ALS-001',
    initials: 'J.D.',
    diagnosisDate: '2023-01-15',
    geneticProfile: 'Mutação SOD1',
    status: 'ativo',
    history: [
      { date: new Date('2023-01-15'), score: 48, fvc: 95, weight: 82 },
      { date: new Date('2023-04-15'), score: 45, fvc: 92, weight: 80 },
      { date: new Date('2023-07-15'), score: 42, fvc: 88, weight: 79 },
      { date: new Date('2023-10-15'), score: 38, fvc: 80, weight: 77 },
      { date: new Date('2024-01-15'), score: 34, fvc: 72, weight: 75 },
    ]
  },
  {
    id: 'ALS-002',
    initials: 'M.R.',
    diagnosisDate: '2022-11-20',
    geneticProfile: 'Esporádica',
    status: 'ativo',
    history: [
      { date: new Date('2023-01-01'), score: 40, fvc: 75, weight: 70 },
      { date: new Date('2023-03-01'), score: 38, fvc: 70, weight: 68 },
      { date: new Date('2023-05-01'), score: 35, fvc: 62, weight: 66 },
      { date: new Date('2023-07-01'), score: 32, fvc: 55, weight: 65 },
      { date: new Date('2023-09-01'), score: 30, fvc: 48, weight: 64 },
    ]
  }
];

export const ALS_PROTEINS_LIST = [
  { name: 'TDP-43', id: 'P06748' },
  { name: 'SOD1', id: 'P00441' },
  { name: 'FUS', id: 'P35637' },
  { name: 'C9orf72', id: 'Q96LT7' }
];
