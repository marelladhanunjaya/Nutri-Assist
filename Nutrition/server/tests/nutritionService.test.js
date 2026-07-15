import assert from 'node:assert/strict';
import test from 'node:test';
import { calculateMacroDistribution, summarizeProgress } from '../src/services/nutritionService.js';

test('calculateMacroDistribution converts grams into calorie percentages', () => {
  const distribution = calculateMacroDistribution({ protein: 100, carbs: 200, fat: 50 });
  assert.deepEqual(distribution, { protein: 24, carbs: 48, fat: 27 });
});

test('calculateMacroDistribution handles an empty plan', () => {
  assert.deepEqual(calculateMacroDistribution({}), { protein: 0, carbs: 0, fat: 0 });
});

test('summarizeProgress calculates adherence, intake and weight change', () => {
  const summary = summarizeProgress([
    { date: '2026-07-01', weightKg: 80, caloriesConsumed: 2200, adherencePercent: 70 },
    { date: '2026-07-02', weightKg: 79.5, caloriesConsumed: 2000, adherencePercent: 90 },
  ], 2100);
  assert.deepEqual(summary, {
    averageAdherence: 80,
    averageCalories: 2100,
    calorieVariance: 0,
    weightChange: -0.5,
    entries: 2,
  });
});
