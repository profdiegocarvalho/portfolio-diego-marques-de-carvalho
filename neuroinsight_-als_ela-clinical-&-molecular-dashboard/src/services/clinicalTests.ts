import { calculateDeclineRate, isFccCritical, calculateWeightLossPct } from './clinicalService';

/**
 * Simple test runner for clinical logic.
 */
export function runClinicalTests() {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  const test = (name: string, fn: () => void) => {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (e) {
      results.push({ name, passed: false, error: e instanceof Error ? e.message : String(e) });
    }
  };

  test('calculateDeclineRate: should return 1.0 for 12 point drop in 12 months', () => {
    const measurements = [
      { date: new Date('2023-01-01'), score: 48 },
      { date: new Date('2024-01-01'), score: 36 }
    ];
    const rate = calculateDeclineRate(measurements);
    if (Math.abs(rate - 1) > 0.05) throw new Error(`Expected ~1.0, got ${rate}`);
  });

  test('isFccCritical: should flag values under threshold', () => {
    if (!isFccCritical(45, 50)) throw new Error('45 should be critical for 50 threshold');
    if (isFccCritical(55, 50)) throw new Error('55 should not be critical for 50 threshold');
  });

  test('calculateWeightLossPct: should calculate correctly', () => {
    const loss = calculateWeightLossPct(100, 90);
    if (loss !== 10) throw new Error(`Expected 10, got ${loss}`);
  });

  return results;
}
