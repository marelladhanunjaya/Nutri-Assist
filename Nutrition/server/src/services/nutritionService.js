export function calculateMacroDistribution(totals = {}) {
  const proteinCalories = Number(totals.protein || 0) * 4;
  const carbCalories = Number(totals.carbs || 0) * 4;
  const fatCalories = Number(totals.fat || 0) * 9;
  const macroCalories = proteinCalories + carbCalories + fatCalories;
  if (!macroCalories) return { protein: 0, carbs: 0, fat: 0 };
  return {
    protein: Math.round((proteinCalories / macroCalories) * 100),
    carbs: Math.round((carbCalories / macroCalories) * 100),
    fat: Math.round((fatCalories / macroCalories) * 100),
  };
}

export function summarizeProgress(entries = [], targetCalories = 2000) {
  if (!entries.length) return { averageAdherence: 0, averageCalories: 0, weightChange: 0, entries: 0 };
  const ordered = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
  const sum = ordered.reduce(
    (acc, row) => ({
      adherence: acc.adherence + Number(row.adherencePercent || 0),
      calories: acc.calories + Number(row.caloriesConsumed || 0),
    }),
    { adherence: 0, calories: 0 }
  );
  const firstWeight = ordered.find((row) => Number.isFinite(Number(row.weightKg)))?.weightKg;
  const lastWeight = [...ordered].reverse().find((row) => Number.isFinite(Number(row.weightKg)))?.weightKg;
  const averageCalories = Math.round(sum.calories / ordered.length);
  return {
    averageAdherence: Math.round(sum.adherence / ordered.length),
    averageCalories,
    calorieVariance: averageCalories - Number(targetCalories || 0),
    weightChange: firstWeight != null && lastWeight != null ? Number((lastWeight - firstWeight).toFixed(1)) : 0,
    entries: ordered.length,
  };
}
