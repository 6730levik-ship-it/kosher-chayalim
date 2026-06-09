import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import ExerciseClip from '../components/ExerciseClip';
import exercises from '../data/exercises.json';
import RestTimer from '../components/RestTimer';
import { CLIPS_CDN, IMG_CDN } from '../lib/supabase';
import { S, C } from '../theme';
import { T } from '../i18n/he';

type Plan = { ex: string; sets: number; reps: string };

export default function Workout({
  exercises: plan,
  onFinish,
}: {
  exercises: Plan[];
  onFinish: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const current = plan[idx];
  const ex = (exercises as any)[current.ex];

  const [done, setDone] = useState<boolean[]>(Array(current.sets).fill(false));
  const [rest, setRest] = useState(false);

  // הקליפ/תמונה נמשכים On-Demand מהשרת (לא נארזים ב-bundle, חוסך נפח אחסון)
  const clipUrl = ex.clip ? CLIPS_CDN + ex.clip : null;
  const imgUrl = ex.image ? IMG_CDN + ex.image : null;

  // איפוס סימוני הסטים במעבר תרגיל
  useEffect(() => {
    setDone(Array(current.sets).fill(false));
  }, [idx]);

  const toggleSet = (i: number) => {
    setDone((d) => {
      const next = d.map((v, k) => (k === i ? !v : v));
      if (next[i]) setRest(true); // טיימר מנוחה קופץ אחרי סימון
      return next;
    });
  };

  const allDone = done.every(Boolean);

  const next = () => {
    if (idx < plan.length - 1) setIdx(idx + 1);
    else onFinish();
  };

  return (
    <ScrollView style={S.wrap} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={S.sub}>תרגיל {idx + 1} מתוך {plan.length}</Text>
      <Text style={S.h1}>{ex.name}</Text>

      {/* קליפ וידאו קצר בלופ — הדגמת ביצוע התרגיל */}
      <View style={anBox}>
        <ExerciseClip url={clipUrl} image={imgUrl} name={ex.name} />
        <View style={muscleTag}>
          <Text style={muscleTxt}>{T.workout.activeMuscle}: {ex.muscle}</Text>
        </View>
      </View>

      {/* טבלת סימון V על סטים */}
      {done.map((v, i) => (
        <Pressable key={i} style={[setRow, v && setRowDone]} onPress={() => toggleSet(i)}>
          <Text style={[S.rowTxt, v && { color: '#fff' }]}>
            {T.workout.set} {i + 1} · {current.reps} {T.workout.reps}
          </Text>
          <Text style={{ fontSize: 22, color: v ? '#fff' : C.line }}>
            {v ? '✔' : '○'}
          </Text>
        </Pressable>
      ))}

      {/* טיימר מנוחה אוטומטי */}
      {rest && <RestTimer seconds={ex.rest ?? 90} onDone={() => setRest(false)} />}

      {/* 3 דגשים טכניים בעברית */}
      <Text style={S.h2}>{T.workout.tips}</Text>
      <View style={S.card}>
        {ex.tips.map((t: string, i: number) => (
          <Text key={i} style={{ fontSize: 15, color: C.ink, textAlign: 'right', marginVertical: 4 }}>
            • {t}
          </Text>
        ))}
      </View>

      <Pressable style={[S.btn, !allDone && { backgroundColor: C.line }]} onPress={next} disabled={!allDone}>
        <Text style={[S.btnTxt, !allDone && { color: C.sub }]}>
          {idx < plan.length - 1 ? 'התרגיל הבא ›' : T.workout.done}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const anBox = {
  backgroundColor: C.card, borderRadius: 20, padding: 12, marginTop: 12,
  shadowColor: '#16203A', shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
} as const;
const muscleTag = { backgroundColor: C.bg, borderRadius: 12, paddingVertical: 8, marginTop: 8 } as const;
const muscleTxt = { textAlign: 'center', color: C.ink, fontWeight: '700', fontSize: 14 } as const;
const setRow = {
  backgroundColor: C.card, borderRadius: 14, padding: 16, marginTop: 8,
  flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between',
  borderWidth: 1, borderColor: C.line,
} as const;
const setRowDone = { backgroundColor: C.ok, borderColor: C.ok } as const;
