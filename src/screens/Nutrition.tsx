import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import nutrition from '../data/nutrition.json';
import { S, C } from '../theme';
import { T } from '../i18n/he';

type Goal = 'mass' | 'keep' | 'cut';

export default function Nutrition({ goal: initial = 'keep' }: { goal?: Goal }) {
  const [goal, setGoal] = useState<Goal>(initial);
  const [eaten, setEaten] = useState<Record<string, boolean>>({});

  const g = (nutrition.goals as any)[goal];
  const target: number = g.protein_target;
  const score = nutrition.protein_items.reduce(
    (sum, it) => sum + (eaten[it.id] ? it.units : 0),
    0
  );
  const pct = Math.min(100, Math.round((score / target) * 100));

  return (
    <ScrollView style={S.wrap} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={S.h1}>{T.food.title}</Text>

      {/* בחירת מטרה */}
      <View style={{ flexDirection: 'row-reverse', gap: 8 }}>
        {(['mass', 'keep', 'cut'] as Goal[]).map((k) => (
          <Pressable key={k} onPress={() => setGoal(k)}
            style={[chip, goal === k && chipOn]}>
            <Text style={[chipTxt, goal === k && { color: '#fff' }]}>{T.goals[k]}</Text>
          </Pressable>
        ))}
      </View>

      {/* מד חלבון יומי */}
      <View style={[S.card, { marginTop: 16 }]}>
        <Text style={S.cardTitle}>{T.food.dailyProtein}</Text>
        <Text style={S.cardSub}>{score} / {target} מנות · {T.food.target} {g.title}</Text>
        <View style={barBg}>
          <View style={[barFill, { width: `${pct}%`, backgroundColor: pct >= 100 ? C.ok : C.accent }]} />
        </View>
      </View>

      {/* רשימת רכיבי חלבון צה"ליים */}
      <Text style={S.h2}>{T.food.markEaten}</Text>
      {nutrition.protein_items.map((it) => {
        const on = !!eaten[it.id];
        return (
          <Pressable key={it.id} onPress={() => setEaten((e) => ({ ...e, [it.id]: !on }))}
            style={[S.row, on && { backgroundColor: C.ok }]}>
            <Text style={[S.rowTxt, on && { color: '#fff' }]}>{it.name} · {it.units} מנות</Text>
            <Text style={{ fontSize: 20, color: on ? '#fff' : C.line }}>{on ? '✔' : '○'}</Text>
          </Pressable>
        );
      })}

      {/* הנחיות תזונה ויזואליות-פרקטיות */}
      <Text style={S.h2}>הנחיות יומיות · {g.title}</Text>
      <View style={S.card}>
        {g.guide.map((line: string, i: number) => (
          <Text key={i} style={{ fontSize: 15, color: C.ink, textAlign: 'right', marginVertical: 5 }}>
            • {line}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const chip = { flex: 1, backgroundColor: C.card, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: C.line } as const;
const chipOn = { backgroundColor: C.accent, borderColor: C.accent } as const;
const chipTxt = { fontSize: 16, fontWeight: '800', color: C.ink } as const;
const barBg = { height: 16, backgroundColor: C.bg, borderRadius: 10, marginTop: 12, overflow: 'hidden' } as const;
const barFill = { height: 16, borderRadius: 10 } as const;
