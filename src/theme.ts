import { StyleSheet } from 'react-native';

// פלטת צבעים בהירה, אנרגטית ודינמית
export const C = {
  bg: '#F4F7FB',
  card: '#FFFFFF',
  ink: '#16203A',
  sub: '#6B7793',
  accent: '#FF6B35',   // כתום אנרגטי
  accent2: '#2E7CF6',  // כחול
  ok: '#22C55E',
  line: '#E6EBF2',
};

export const S = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg, padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg, padding: 24 },
  h1: { fontSize: 26, fontWeight: '800', color: C.ink, textAlign: 'right', marginBottom: 8 },
  h2: { fontSize: 18, fontWeight: '700', color: C.ink, textAlign: 'right', marginTop: 12, marginBottom: 4 },
  sub: { fontSize: 14, color: C.sub, textAlign: 'right' },
  card: {
    backgroundColor: C.card, borderRadius: 20, padding: 22, marginTop: 14,
    shadowColor: '#16203A', shadowOpacity: 0.07, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  accentCard: { backgroundColor: C.accent },
  cardTitle: { fontSize: 20, fontWeight: '800', color: C.ink, textAlign: 'right' },
  cardTitleW: { fontSize: 20, fontWeight: '800', color: '#fff', textAlign: 'right' },
  cardSub: { fontSize: 14, color: C.sub, textAlign: 'right', marginTop: 4 },
  cardSubW: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'right', marginTop: 4 },
  metric: { fontSize: 46, fontWeight: '900', color: C.ink, textAlign: 'center' },
  metricLbl: { fontSize: 14, color: C.sub, textAlign: 'center', marginBottom: 14 },
  btn: { backgroundColor: C.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  btnGhost: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 12 },
  btnTxt: { color: '#fff', fontSize: 17, fontWeight: '800' },
  btnTxtDark: { color: C.ink, fontSize: 17, fontWeight: '800' },
  row: { backgroundColor: C.card, borderRadius: 14, padding: 14, marginTop: 8, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  rowTxt: { fontSize: 16, color: C.ink, textAlign: 'right', fontWeight: '600' },
});
