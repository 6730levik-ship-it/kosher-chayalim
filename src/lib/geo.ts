// פונקציות עזר לחישובי ריצה — קוד קשיח, ללא AI

// מרחק בין שתי נקודות GPS בק"מ (Haversine)
export function haversine(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371; // רדיוס כדה"א בק"מ
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const la1 = (a.latitude * Math.PI) / 180;
  const la2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const fmtTime = (s: number): string => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
};

// קצב בדקות לק"מ
export const fmtPace = (secPerKm: number): string => {
  if (!isFinite(secPerKm) || secPerKm <= 0) return "0:00";
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
};

// קוד קצר לקישור ריצה קבוצתית
export const shortCode = (): string =>
  Math.random().toString(36).slice(2, 8).toUpperCase();
