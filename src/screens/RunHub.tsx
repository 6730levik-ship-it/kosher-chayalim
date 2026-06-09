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

/* ---------- מצב א: רץ לבד (שעון GPS בדיוק גבוה) ---------- */
// ספי סינון רעשי GPS — מונעים ניפוח מרחק
const ACC_MAX_M = 25;   // פוסלים fix עם רדיוס אי-ודאות גדול מ-25 מ'
const SPEED_MAX = 10;   // מ'/ש' (~36 קמ"ש) — מעל זה זו קפיצת GPS, לא ריצה

function SoloRun({ user, onBack }: { user: any; onBack: () => void }) {
  const [running, setRunning] = useState(false);
  const [dist, setDist] = useState(0);
  const [sec, setSec] = useState(0);
  const [acc, setAcc] = useState<number | null>(null); // דיוק GPS נוכחי (מ')
  const [acquiring, setAcquiring] = useState(false);    // ממתין לאיתות ראשון תקין
  const sub = useRef<Location.LocationSubscription | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const last = useRef<Location.LocationObjectCoords | null>(null);
  const lastTs = useRef<number | null>(null);

  const start = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    setRunning(true);
    setDist(0);
    setSec(0);
    setAcquiring(true);
    last.current = null;
    lastTs.current = null;
    timer.current = setInterval(() => setSec((s) => s + 1), 1000);
    sub.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation, // הדיוק הגבוה ביותר (חיישנים)
        distanceInterval: 5,                            // עדכון כל 5 מטרים
        timeInterval: 1000,                             // Android: לפחות פעם בשנייה
      },
      (loc) => {
        const c = loc.coords;
        setAcc(c.accuracy ?? null);
        // פוסלים נקודות באיכות נמוכה — לא מעדכנים עוגן ולא צוברים
        if (c.accuracy == null || c.accuracy > ACC_MAX_M) return;
        if (last.current != null && lastTs.current != null) {
          const stepKm = haversine(last.current, c);
          const dt = (loc.timestamp - lastTs.current) / 1000;
          const speed = dt > 0 ? (stepKm * 1000) / dt : 0;
          if (speed > SPEED_MAX) return; // קפיצת GPS — מתעלמים, שומרים על העוגן הקודם
          setDist((d) => d + stepKm);
        }
        last.current = c;
        lastTs.current = loc.timestamp;
        setAcquiring(false);
      }
    );
  };

  const stop = async () => {
    sub.current?.remove();
    if (timer.current) clearInterval(timer.current);
    setRunning(false);
    setAcquiring(false);
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

  // מחוון איכות GPS: ירוק ≤10מ', כתום ≤25מ', אפור גרוע/אין
  const accColor = acc == null ? C.sub : acc <= 10 ? C.ok : acc <= ACC_MAX_M ? '#C58A21' : C.sub;
  const accLabel = acquiring
    ? 'ממתין לאיתות GPS…'
    : acc == null
    ? 'GPS לא זמין'
    : `דיוק GPS: ±${Math.round(acc)} מ׳`;

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
        {running && (
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: accColor, marginLeft: 7 }} />
            <Text style={{ color: accColor, fontSize: 14, fontWeight: '700' }}>{accLabel}</Text>
          </View>
        )}
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
