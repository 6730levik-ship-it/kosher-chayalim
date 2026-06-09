import { StyleSheet } from 'react-native';

// פלטה צבאית-טקטית: גוונים מנומרים (זית/חאקי), ירוק בהיר, עיצוב בהיר ונקי
export const C = {
  bg: '#EBEEE3',     // ירוק-שדה בהיר מאוד (רקע)
  card: '#FFFFFF',   // כרטיסים נקיים
  ink: '#222B1E',    // דיו זית כהה
  sub: '#717A64',    // אפור-זית משני
  accent: '#5C7A29', // ירוק זית בהיר — צבע פעולה ראשי
  accent2: '#33471F',// ירוק יער עמוק — כותרות/משני
  ok: '#6FA53A',     // ירוק "אישור" בהיר יותר
  line: '#D7DCC8',   // גבול עדין בגוון זית
};

export const S = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: 'transparent', padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent', padding: 24 },
  h1: { fontSize: 26, fontWeight: '800', color: C.ink, textAlign: 'right', marginBottom: 8 },
  h2: { fontSize: 18, fontWeight: '700', color: C.ink, textAlign: 'right', marginTop: 12, marginBottom: 4 },
  sub: { fontSize: 14, color: C.sub, textAlign: 'right' },
  card: {
    backgroundColor: C.card, borderRadius: 14, padding: 22, marginTop: 14,
    borderWidth: 1, borderColor: C.line,
    shadowColor: '#222B1E', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  accentCard: { backgroundColor: C.accent, borderColor: C.accent },
  cardTitle: { fontSize: 20, fontWeight: '800', color: C.ink, textAlign: 'right' },
  cardTitleW: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'right' },
  cardSub: { fontSize: 14, color: C.sub, textAlign: 'right', marginTop: 4 },
  cardSubW: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'right', marginTop: 4 },
  metric: { fontSize: 46, fontWeight: '900', color: C.ink, textAlign: 'center' },
  metricLbl: { fontSize: 14, color: C.sub, textAlign: 'center', marginBottom: 14 },
  btn: { backgroundColor: C.accent, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  btnGhost: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  btnTxt: { color: '#fff', fontSize: 17, fontWeight: '800' },
  btnTxtDark: { color: C.ink, fontSize: 17, fontWeight: '800' },
  row: { backgroundColor: C.card, borderRadius: 10, padding: 14, marginTop: 8, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: C.line },
  rowTxt: { fontSize: 16, color: C.ink, textAlign: 'right', fontWeight: '600' },
});
