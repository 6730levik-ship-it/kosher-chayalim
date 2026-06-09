import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Path } from 'react-native-svg';

// רקע קמופלאז' פרוצדורלי — וקטורי, אפס אחסון, גוונים עדינים ובהירים
const W = 120;
const H = 240;
const BASE = '#E9ECE0';
// שכבות כתמים — ניגודיות נמוכה כדי שהטקסט יישאר קריא
const LAYERS = [
  { fill: '#DCE1CD', n: 9, r: 28, seed: 7 },
  { fill: '#CFD7BD', n: 7, r: 21, seed: 23 },
  { fill: '#C0CAAA', n: 6, r: 15, seed: 53 },
];

// PRNG דטרמיניסטי (mulberry32) — אותו דפוס בכל בנייה
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// כתם אורגני חלק סגור דרך נקודות-אמצע + עקומות ריבועיות
function blob(cx: number, cy: number, r: number, rand: () => number): string {
  const pts = 8;
  const a: [number, number][] = [];
  for (let i = 0; i < pts; i++) {
    const ang = (i / pts) * Math.PI * 2;
    const rr = r * (0.65 + rand() * 0.7);
    a.push([cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr]);
  }
  const mids = a.map((p, i) => {
    const nx = a[(i + 1) % pts];
    return [(p[0] + nx[0]) / 2, (p[1] + nx[1]) / 2] as [number, number];
  });
  let d = `M${mids[pts - 1][0].toFixed(1)},${mids[pts - 1][1].toFixed(1)}`;
  for (let i = 0; i < pts; i++) {
    d += ` Q${a[i][0].toFixed(1)},${a[i][1].toFixed(1)} ${mids[i][0].toFixed(1)},${mids[i][1].toFixed(1)}`;
  }
  return d + 'Z';
}

export default function CamoBackground() {
  const layers = useMemo(
    () =>
      LAYERS.map((l) => {
        const rand = rng(l.seed);
        const ds: string[] = [];
        for (let i = 0; i < l.n; i++) {
          ds.push(blob(rand() * W, rand() * H, l.r * (0.7 + rand() * 0.6), rand));
        }
        return { fill: l.fill, ds };
      }),
    []
  );
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <Rect x={0} y={0} width={W} height={H} fill={BASE} />
        {layers.map((l, li) => l.ds.map((d, i) => <Path key={`${li}-${i}`} d={d} fill={l.fill} />))}
      </Svg>
    </View>
  );
}
