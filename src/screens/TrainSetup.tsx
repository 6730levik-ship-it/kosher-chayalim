import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import programs from '../data/programs.json';
import Workout from './Workout';
import { S, C } from '../theme';
import { T } from '../i18n/he';

type Equip = 'gym' | 'calisthenics' | 'bodyweight';

// המשתמש בוחר ימים + ציוד -> נשלפת התוכנית הקשיחה המתאימה
export default function TrainSetup() {
  // web בלבד: ?day=A&equip=gym פותח ישר את מסך התרגיל (לתצוגה)
  const qs = Platform.OS === 'web' && typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search) : null;
  const [days, setDays] = useState(3);
  const [equip, setEquip] = useState<Equip>((qs?.get('equip') as Equip) || 'bodyweight');
  const [activeDay, setActiveDay] = useState<string | null>(qs?.get('day') || null);

  const key = `${days}_${equip}`;
  const program = (programs as any)[key] ?? (programs as any)[`3_${equip}`];

  if (activeDay) {
    return (
      <Workout
        exercises={program.days[activeDay].exercises}
        onFinish={() => setActiveDay(null)}
      />
    );
  }

  return (
    <ScrollView style={S.wrap} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={S.h1}>{T.tabs.train}</Text>

      <Text style={S.h2}>כמה ימי אימון בשבוע?</Text>
      <View style={{ flexDirection: 'row-reverse', gap: 8 }}>
        {[3, 4].map((d) => (
          <Pressable key={d} onPress={() => setDays(d)} style={[chip, days === d && chipOn]}>
            <Text style={[chipTxt, days === d && { color: '#fff' }]}>{d} ימים</Text>
          </Pressable>
        ))}
      </View>

      <Text style={S.h2}>ציוד זמין בבסיס</Text>
      {(['gym', 'calisthenics', 'bodyweight'] as Equip[]).map((e) => (
        <Pressable key={e} onPress={() => setEquip(e)} style={[S.row, equip === e && { backgroundColor: C.accent2 }]}>
          <Text style={[S.rowTxt, equip === e && { color: '#fff' }]}>{T.equipment[e]}</Text>
          <Text style={{ fontSize: 20, color: equip === e ? '#fff' : C.line }}>{equip === e ? '◉' : '○'}</Text>
        </Pressable>
      ))}

      <Text style={S.h2}>{program.title} · מודל {program.model}</Text>
      {Object.entries(program.days).map(([d, info]: any) => (
        <Pressable key={d} style={S.card} onPress={() => setActiveDay(d)}>
          <Text style={S.cardTitle}>אימון {d} — {info.name}</Text>
          <Text style={S.cardSub}>{info.exercises.length} תרגילים ›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const chip = { flex: 1, backgroundColor: C.card, borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: C.line } as const;
const chipOn = { backgroundColor: C.accent, borderColor: C.accent } as const;
const chipTxt = { fontSize: 16, fontWeight: '800', color: C.ink } as const;
