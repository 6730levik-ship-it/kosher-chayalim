// מחשבון מאקרו — נוסחאות תזונה מקובלות, חישוב קשיח (ללא AI)
// מבוסס על גרם-לק"ג-משקל-גוף, מותאם למטרה ולאוכלוסייה פעילה (חיילים)

export type Goal = 'mass' | 'keep' | 'cut';

// מקדמים לכל מטרה:
//  kcalPerKg  — קלוריות יומיות לק"ג משקל גוף
//  proteinPerKg — חלבון (ג') לק"ג   |  fatPerKg — שומן (ג') לק"ג
const COEF: Record<Goal, { kcalPerKg: number; proteinPerKg: number; fatPerKg: number }> = {
  mass: { kcalPerKg: 38, proteinPerKg: 2.0, fatPerKg: 1.0 }, // עודף קלורי לבניית שריר
  keep: { kcalPerKg: 33, proteinPerKg: 1.8, fatPerKg: 0.9 }, // איזון
  cut:  { kcalPerKg: 28, proteinPerKg: 2.2, fatPerKg: 0.8 }, // גירעון + חלבון גבוה לשימור שריר
};

export type Macros = {
  kcal: number;
  protein: number; // ג'
  fat: number;     // ג'
  carbs: number;   // ג'
  fiber: number;   // ג'
  water: number;   // ליטר
};

export function calcMacros(weightKg: number, goal: Goal): Macros {
  const w = isFinite(weightKg) && weightKg > 0 ? weightKg : 0;
  const c = COEF[goal];
  const kcal = Math.round(w * c.kcalPerKg);
  const protein = Math.round(w * c.proteinPerKg);
  const fat = Math.round(w * c.fatPerKg);
  // פחמימה = יתרת הקלוריות אחרי חלבון (4 קק"ל/ג') ושומן (9 קק"ל/ג'), חלקי 4
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  // סיבים תזונתיים: ~14 ג' לכל 1000 קק"ל (המלצת USDA)
  const fiber = Math.round((kcal / 1000) * 14);
  // מים: ~35 מ"ל לק"ג משקל גוף
  const water = +(w * 0.035).toFixed(1);
  return { kcal, protein, fat, carbs, fiber, water };
}
