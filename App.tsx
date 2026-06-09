import { useEffect, useState } from 'react';
import { View, Text, Pressable, I18nManager, StatusBar, SafeAreaView, Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { supabase } from './src/lib/supabase';
import Onboarding from './src/screens/Onboarding';
import RunHub from './src/screens/RunHub';
import TrainSetup from './src/screens/TrainSetup';
import Nutrition from './src/screens/Nutrition';
import Profile from './src/screens/Profile';
import JoinRun from './src/screens/JoinRun';
import { C } from './src/theme';
import { T } from './src/i18n/he';
import Icon from './src/components/Icon';
import CamoBackground from './src/components/CamoBackground';

// כפיית RTL לכל האפליקציה
if (!I18nManager.isRTL) {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
}

type Tab = 'run' | 'train' | 'food' | 'me';

// חילוץ קוד ריצה מתוך דיפ-לינק: fitnessil://run/<CODE>
function parseRunCode(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/run\/([A-Za-z0-9]+)/);
  return m ? m[1] : null;
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [ready, setReady] = useState(false);
  // web בלבד: פרמטרים ל-URL לצורך תצוגה/דמו (?guest=1&tab=train)
  const q = Platform.OS === 'web' && typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search) : null;
  const [tab, setTab] = useState<Tab>((q?.get('tab') as Tab) || 'run');
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [guest, setGuest] = useState(q?.get('guest') === '1'); // מצב תצוגה ללא התחברות

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  // יצירת שורת פרופיל אוטומטית בכניסה ראשונה
  useEffect(() => {
    if (!session?.user) return;
    const u = session.user;
    supabase.from('profiles').upsert(
      { id: u.id, name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? 'חייל' },
      { onConflict: 'id', ignoreDuplicates: true }
    ).then(() => {});
  }, [session?.user?.id]);

  // דיפ-לינקים — גם בפתיחה קרה וגם כשהאפליקציה פתוחה
  useEffect(() => {
    Linking.getInitialURL().then((url) => {
      const code = parseRunCode(url);
      if (code) setJoinCode(code);
    });
    const sub = Linking.addEventListener('url', ({ url }) => {
      const code = parseRunCode(url);
      if (code) setJoinCode(code);
    });
    return () => sub.remove();
  }, []);

  if (!ready) return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  if (!session && !guest) return <Onboarding onGuest={() => setGuest(true)} />;

  // משתמש אמיתי, או משתמש דמה במצב תצוגה (אורח)
  const user = session?.user ?? { id: 'demo-guest', user_metadata: { name: 'אורח' } };

  // קישור ריצה גובר על הניווט הרגיל
  if (joinCode)
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <CamoBackground />
        <StatusBar barStyle="dark-content" />
        <JoinRun code={joinCode} user={user} onClose={() => setJoinCode(null)} />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <CamoBackground />
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        {tab === 'run' && <RunHub user={user} />}
        {tab === 'train' && <TrainSetup />}
        {tab === 'food' && <Nutrition />}
        {tab === 'me' && <Profile user={user} />}
      </View>

      {/* ניווט תחתון — עיצוב טקטי נקי */}
      <View style={tabBar}>
        {(['run', 'train', 'food', 'me'] as Tab[]).map((k) => {
          const active = tab === k;
          return (
            <Pressable key={k} style={{ flex: 1, alignItems: 'center', paddingTop: 6 }} onPress={() => setTab(k)}>
              <View style={{ height: 3, width: 26, borderRadius: 2, marginBottom: 6, backgroundColor: active ? C.accent : 'transparent' }} />
              <Icon name={k} color={active ? C.accent : C.sub} size={24} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: active ? C.accent : C.sub, marginTop: 3 }}>
                {T.tabs[k]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const tabBar = {
  flexDirection: 'row-reverse' as const,
  backgroundColor: C.card,
  paddingVertical: 10,
  borderTopWidth: 1,
  borderTopColor: C.line,
};
