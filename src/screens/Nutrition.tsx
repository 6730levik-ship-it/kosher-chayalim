import { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput } from 'react-native';
import nutrition from '../data/nutrition.json';
import { calcMacros, Goal } from '../lib/macros';
import { S, C } from '../theme';
import { T } from '../i18n/he';

export default function Nutrition({ goal: initial = 'keep' }: { goal?: Goal }) {
  const [goal, setGoal] = useState<Goal>(initial);
  const [weight, setWeight] = useState('75');

  const g = (nutrition.goals as any)[goal];
  const w = parseFloat(weight);
  const m = calcMacros(w, goal);
  const valid = isFinite(w) && w > 0;

  return (
    <ScrollView style={S.wrap} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={S.h1}>{T.food.title}</Text>

      {/* בחירת מטרה */}
      <View style={{ flexDirection: 'row-reverse', gap: 8 }}>
        {(['mass', 'keep', 'cut'] as Goal[]).map((k) => (
          <Pressable key={k} onPress={() => setGoal(k)} style={[chip, goal === k && chipOn]}>
            <Text style={[chipTxt, goal === k && { color: '#fff' }]}>{T.goals[k]}</Text>
          </Pressable>
        ))}
      </View>

      {/* קלט משקל גוף */}
      <Text style={S.h2}>משקל גוף (ק"ג)</Text>
      <TextInput
        value={weight}
        onChangeText={(t) => setWeight(t.replace(/[^0-9.]/g, ''))}
        keyboardType="numeric"
        style={input}
        textAlign="right"
        placeholder="לדוגמה: 75"
        placeholderTextColor={C.sub}
      />

      {/* תוצאות המחשבון */}
      {valid ? (
        <View style={[S.card, { marginTop: 16 }]}>
          <Text style={S.cardSub}>יעד יומי · {g.title}</Text>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'flex-end', marginTop: 2 }}>
            <Text style={{ fontSize: 40, fontWeight: '900', color: C.ink }}>{m.kcal.toLocaleString()}</Text>
            <Text style={{ fontSize: 16, color: C.sub, fontWeight: '700', marginRight: 6, marginBottom: 7 }}>קלוריות</Text>
          </View>

          <View style={{ height: 1, backgroundColor: C.line, marginVertical: 12 }} />

          <MacroRow label="חלבון" grams={m.protein} kcal={m.protein * 4} total={m.kcal} color={C.accent} />
          <MacroRow label="פחמימה" grams={m.carbs} kcal={m.carbs * 4} total={m.kcal} color="#C58A21" />
          <MacroRow label="שומן" grams={m.fat} kcal={m.fat * 9} total={m.kcal} color={C.accent2} />

          <View style={{ height: 1, backgroundColor: C.line, marginVertical: 12 }} />

          <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between' }}>
            <SmallStat label="סיבים תזונתיים" value={`${m.fiber} ג'`} />
            <SmallStat label="מים" value={`${m.water} ליטר`} />
          </View>
        </View>
      ) : (
        <View style={[S.card, { marginTop: 16 }]}>
          <Text style={S.cardSub}>הזן משקל גוף תקין כדי לחשב את היעד היומי.</Text>
        </View>
      )}

      {/* תפריט מעשי לפי מטרה */}
      <Text style={S.h2}>תפריט מעשי · {g.title}</Text>
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

function MacroRow({ label, grams, kcal, total, color }: { label: string; grams: number; kcal: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((kcal / total) * 100) : 0;
  return (
    <View style={{ marginVertical: 6 }}>
      <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginLeft: 8 }} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.ink }}>{label}</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '800', color: C.ink }}>
          {grams} ג'  <Text style={{ fontSize: 13, color: C.sub, fontWeight: '600' }}>· {pct}% · {kcal} קק"ל</Text>
        </Text>
      </View>
      <View style={{ height: 7, backgroundColor: C.bg, borderRadius: 4, marginTop: 6, overflow: 'hidden' }}>
        <View style={{ height: 7, width: `${pct}%`, backgroundColor: color, borderRadius: 4 }} />
      </View>
    </View>
  );
}

function SmallStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 20, fontWeight: '900', color: C.ink }}>{value}</Text>
      <Text style={{ fontSize: 13, color: C.sub, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const chip = { flex: 1, backgroundColor: C.card, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: C.line } as const;
const chipOn = { backgroundColor: C.accent, borderColor: C.accent } as const;
const chipTxt = { fontSize: 16, fontWeight: '800', color: C.ink } as const;
const input = {
  backgroundColor: C.card,
  borderRadius: 14,
  padding: 14,
  fontSize: 22,
  fontWeight: '800' as const,
  color: C.ink,
  borderWidth: 1,
  borderColor: C.line,
  marginTop: 6,
};
