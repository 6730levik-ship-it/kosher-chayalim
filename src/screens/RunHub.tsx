import { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, FlatList, TextInput, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';
import { haversine, fmtTime, fmtPace, shortCode } from '../lib/geo';
import { S, C } from '../theme';
import { T } from '../i18n/he';

type Mode = 'hub' | 'solo' | 'group';

export default function RunHub({ user }: { user: any }) {
  const [mode, setMode] = useState<Mode>('hub');

  if (mode === 'solo') return <SoloRun user={user} onBack={() => setMode('hub')} />;
  if (mode === 'group') return <GroupRun user={user} onBack={() => setMode('hub')} />;

  return (
    <View style={S.wrap}>
      <Text style={S.h1}>{T.run.title}</Text>

      <Pressable style={S.card} onPress={() => setMode('solo')}>
        <Text style={S.cardTitle}>🏃 {T.run.solo}</Text>
        <Text style={S.cardSub}>{T.run.soloSub}</Text>
      </Pressable>

      <Pressable style={[S.card, S.accentCard]} onPress={() => setMode('group')}>
        <Text style={S.cardTitleW}>👥 {T.run.group}</Text>
        <Text style={S.cardSubW}>{T.run.groupSub}</Text>
      </Pressable>
    </View>
  );
}

/* ---------- מצב א: רץ לבד (GPS חומרה) ---------- */
function SoloRun({ user, onBack }: { user: any; onBack: () => void }) {
  const [running, setRunning] = useState(false);
  const [dist, setDist] = useState(0);
  const [sec, setSec] = useState(0);
  const sub = useRef<Location.LocationSubscription | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const last = useRef<Location.LocationObjectCoords | null>(null);

  const start = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    setRunning(true);
    last.current = null;
    timer.current = setInterval(() => setSec((s) => s + 1), 1000);
    sub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 5 },
      ({ coords }) => {
        if (last.current) setDist((d) => d + haversine(last.current!, coords));
        last.current = coords;
      }
    );
  };

  const stop = async () => {
    sub.current?.remove();
    if (timer.current) clearInterval(timer.current);
    setRunning(false);
    const pace = dist > 0 ? fmtPace(sec / dist) : '-';
    // נשמר כטקסט קל בלבד בענן (פרופיל אישי)
    await supabase.from('runs').insert({
      owner: user.id,
      distance_km: +dist.toFixed(2),
      time_sec: sec,
      pace,
      mode: 'solo',
    });
    onBack();
  };

  return (
    <View style={S.wrap}>
      <Pressable onPress={onBack}><Text style={S.sub}>‹ חזרה</Text></Pressable>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={S.metric}>{dist.toFixed(2)}</Text>
        <Text style={S.metricLbl}>{T.run.distance}</Text>
        <Text style={S.metric}>{fmtTime(sec)}</Text>
        <Text style={S.metricLbl}>{T.run.time}</Text>
        <Text style={[S.metric, { color: C.accent }]}>
          {dist > 0 ? fmtPace(sec / dist) : '0:00'}
        </Text>
        <Text style={S.metricLbl}>{T.run.pace}</Text>
      </View>
      {!running ? (
        <Pressable style={S.btn} onPress={start}>
          <Text style={S.btnTxt}>{T.run.start}</Text>
        </Pressable>
      ) : (
        <Pressable style={[S.btn, { backgroundColor: C.ink }]} onPress={stop}>
          <Text style={S.btnTxt}>{T.run.stop}</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ---------- מצב ב: מארגן ריצה קבוצתית ---------- */
function GroupRun({ user, onBack }: { user: any; onBack: () => void }) {
  const [km, setKm] = useState('3');
  const [hour, setHour] = useState('17:00');
  const [run, setRun] = useState<{ id: string; code: string } | null>(null);
  const [parts, setParts] = useState<any[]>([]);

  // האזנה חיה למצטרפים דרך הקישור
  useEffect(() => {
    if (!run) return;
    supabase
      .from('group_participants')
      .select('*')
      .eq('run_id', run.id)
      .then(({ data }) => setParts(data ?? []));

    const ch = supabase
      .channel('gr_' + run.code)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'group_participants', filter: `run_id=eq.${run.id}` },
        ({ new: p }) => setParts((prev) => [...prev, p])
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [run]);

  const create = async () => {
    const code = shortCode();
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from('group_runs')
      .insert({
        owner: user.id,
        code,
        distance_km: Number(km),
        start_at: `${today}T${hour}:00`,
      })
      .select('id, code')
      .single();
    setRun(data as any);
  };

  const share = () => {
    if (!run) return;
    const url = Linking.createURL('/run/' + run.code); // דיפ-לינק לאפליקציה
    const msg = `🏃 ריצה קבוצתית!\nמרחק: ${km} ק"מ | שעה: ${hour}\nלחץ להצטרפות: ${url}`;
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(msg)}`);
  };

  if (!run) {
    return (
      <View style={S.wrap}>
        <Pressable onPress={onBack}><Text style={S.sub}>‹ חזרה</Text></Pressable>
        <Text style={S.h1}>{T.run.group}</Text>
        <Text style={S.h2}>{T.run.distance}</Text>
        <TextInput value={km} onChangeText={setKm} keyboardType="numeric"
          style={input} textAlign="right" />
        <Text style={S.h2}>שעת התחלה</Text>
        <TextInput value={hour} onChangeText={setHour}
          style={input} textAlign="right" placeholder="17:00" />
        <Pressable style={S.btn} onPress={create}>
          <Text style={S.btnTxt}>{T.run.create}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={S.wrap}>
      <Pressable onPress={onBack}><Text style={S.sub}>‹ חזרה</Text></Pressable>
      <Text style={S.h1}>ריצה {km} ק"מ · {hour}</Text>
      <Text style={S.sub}>קוד: {run.code}</Text>
      <Pressable style={[S.btn, { backgroundColor: '#25D366' }]} onPress={share}>
        <Text style={S.btnTxt}>{T.run.share}</Text>
      </Pressable>
      <Text style={S.h2}>{T.run.joined} ({parts.length})</Text>
      <FlatList
        scrollEnabled={false}
        data={parts}
        keyExtractor={(p) => p.user_id}
        renderItem={({ item }) => (
          <View style={S.row}>
            <Text style={S.rowTxt}>{item.name}</Text>
            <Text style={{ color: C.ok, fontSize: 18 }}>✔</Text>
          </View>
        )}
      />
    </ScrollView>
  );
}

const input = {
  backgroundColor: C.card,
  borderRadius: 14,
  padding: 14,
  fontSize: 18,
  borderWidth: 1,
  borderColor: C.line,
  marginTop: 6,
} as const;
