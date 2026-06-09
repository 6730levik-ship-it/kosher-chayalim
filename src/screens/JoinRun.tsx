import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { supabase } from '../lib/supabase';
import { S, C } from '../theme';
import { T } from '../i18n/he';

// דף שנפתח כשמקליקים על הקישור: fitnessil://run/<CODE>
// מסמן אוטומטית את המשתמש כמשתתף ומציג את רשימת הנכנסים.
export default function JoinRun({
  code,
  user,
  onClose,
}: {
  code: string;
  user: any;
  onClose: () => void;
}) {
  const [run, setRun] = useState<any>(null);
  const [parts, setParts] = useState<any[]>([]);
  const [state, setState] = useState<'loading' | 'ok' | 'notfound'>('loading');

  useEffect(() => {
    let ch: any;
    (async () => {
      const { data: gr } = await supabase
        .from('group_runs').select('*').eq('code', code).single();
      if (!gr) { setState('notfound'); return; }
      setRun(gr);

      // שם החייל מהפרופיל
      const { data: prof } = await supabase
        .from('profiles').select('name').eq('id', user.id).single();
      const myName = prof?.name || 'חייל';

      // סימון כמשתתף (idempotent)
      await supabase.from('group_participants')
        .upsert({ run_id: gr.id, user_id: user.id, name: myName });

      const { data: list } = await supabase
        .from('group_participants').select('*').eq('run_id', gr.id);
      setParts(list ?? []);
      setState('ok');

      // עדכון חי של מצטרפים נוספים
      ch = supabase.channel('join_' + code)
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'group_participants', filter: `run_id=eq.${gr.id}` },
          ({ new: p }) => setParts((prev) =>
            prev.some((x) => x.user_id === p.user_id) ? prev : [...prev, p]))
        .subscribe();
    })();
    return () => { if (ch) supabase.removeChannel(ch); };
  }, [code]);

  if (state === 'loading')
    return <View style={S.center}><ActivityIndicator size="large" color={C.accent} /></View>;

  if (state === 'notfound')
    return (
      <View style={S.center}>
        <Text style={{ fontSize: 48 }}>🔍</Text>
        <Text style={S.h1}>הריצה לא נמצאה</Text>
        <Text style={S.sub}>ייתכן שהקישור פג או שגוי</Text>
        <Pressable style={S.btn} onPress={onClose}><Text style={S.btnTxt}>חזרה</Text></Pressable>
      </View>
    );

  const when = run.start_at ? new Date(run.start_at) : null;
  const hh = when ? `${String(when.getHours()).padStart(2, '0')}:${String(when.getMinutes()).padStart(2, '0')}` : '';

  return (
    <View style={S.wrap}>
      <View style={[S.card, S.accentCard, { marginTop: 40 }]}>
        <Text style={S.cardTitleW}>✅ נרשמת לריצה!</Text>
        <Text style={S.cardSubW}>{run.distance_km} ק"מ · בשעה {hh}</Text>
      </View>

      <Text style={S.h2}>{T.run.joined} ({parts.length})</Text>
      <FlatList
        data={parts}
        keyExtractor={(p) => p.user_id}
        renderItem={({ item }) => (
          <View style={S.row}>
            <Text style={S.rowTxt}>
              {item.user_id === user.id ? `${item.name} (${T.run.you})` : item.name}
            </Text>
            <Text style={{ color: C.ok, fontSize: 18 }}>✔</Text>
          </View>
        )}
      />

      <Pressable style={S.btnGhost} onPress={onClose}>
        <Text style={S.btnTxtDark}>סגור</Text>
      </Pressable>
    </View>
  );
}
