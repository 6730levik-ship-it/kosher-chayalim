import { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { S, C } from '../theme';
import { T } from '../i18n/he';

// פרופיל אישי + טבלת ליגה פלוגתית
export default function Profile({ user }: { user: any }) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('פלוגה א');
  const [saved, setSaved] = useState(true);
  const [league, setLeague] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);

  const loadLeague = useCallback(async (u: string) => {
    const { data } = await supabase
      .from('league').select('*').eq('unit', u)
      .order('total_km', { ascending: false });
    setLeague(data ?? []);
    setMe((data ?? []).find((r) => r.id === user.id) ?? null);
  }, [user.id]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('profiles').select('name, unit').eq('id', user.id).single();
      if (data) {
        setName(data.name ?? '');
        setUnit(data.unit ?? 'פלוגה א');
        loadLeague(data.unit ?? 'פלוגה א');
      }
    })();
  }, []);

  const save = async () => {
    await supabase.from('profiles')
      .upsert({ id: user.id, name, unit });
    setSaved(true);
    loadLeague(unit);
  };

  const medal = (i: number) => (i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`);

  return (
    <ScrollView style={S.wrap} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={S.h1}>{T.tabs.me}</Text>

      {/* כרטיס סטטיסטיקה אישית */}
      <View style={[S.card, { flexDirection: 'row-reverse', justifyContent: 'space-around' }]}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: '900', color: C.accent }}>{me?.total_km ?? 0}</Text>
          <Text style={S.sub}>ק"מ סה"כ</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 28, fontWeight: '900', color: C.accent2 }}>{me?.runs_count ?? 0}</Text>
          <Text style={S.sub}>ריצות</Text>
        </View>
      </View>

      {/* עריכת שם + פלוגה */}
      <Text style={S.h2}>שם</Text>
      <TextInput value={name} onChangeText={(v) => { setName(v); setSaved(false); }}
        placeholder="השם שלך" textAlign="right" style={input} />
      <Text style={S.h2}>פלוגה</Text>
      <TextInput value={unit} onChangeText={(v) => { setUnit(v); setSaved(false); }}
        placeholder="פלוגה א" textAlign="right" style={input} />
      {!saved && (
        <Pressable style={S.btn} onPress={save}><Text style={S.btnTxt}>שמור</Text></Pressable>
      )}

      {/* טבלת ליגה פלוגתית */}
      <Text style={S.h2}>🏆 טבלת ליגה — {unit}</Text>
      <FlatList
        scrollEnabled={false}
        data={league}
        keyExtractor={(r) => r.id}
        renderItem={({ item, index }) => (
          <View style={[S.row, item.id === user.id && { borderWidth: 2, borderColor: C.accent }]}>
            <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 18, width: 34, textAlign: 'center' }}>{medal(index)}</Text>
              <Text style={S.rowTxt}>{item.name}</Text>
            </View>
            <Text style={{ fontWeight: '800', color: C.ink }}>{item.total_km} ק"מ</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={S.sub}>עוד אין נתונים — צא לריצה ראשונה!</Text>}
      />

      <Pressable style={[S.btnGhost, { marginTop: 24 }]} onPress={() => supabase.auth.signOut()}>
        <Text style={S.btnTxtDark}>התנתק</Text>
      </Pressable>
    </ScrollView>
  );
}

const input = {
  backgroundColor: C.card, borderRadius: 14, padding: 14, fontSize: 18,
  borderWidth: 1, borderColor: C.line, marginTop: 6,
} as const;
