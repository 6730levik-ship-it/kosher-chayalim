import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { signInWithGoogle, signInWithApple, isAppleAvailable } from '../lib/auth';
import { S, C } from '../theme';
import { T } from '../i18n/he';

// כניסה אוטומטית בלחיצה אחת — Google / Apple נייטיבי, החשבון הקיים במכשיר קופץ.
export default function Onboarding({ onGuest }: { onGuest?: () => void }) {
  const [busy, setBusy] = useState<null | 'google' | 'apple'>(null);

  const run = async (which: 'google' | 'apple', fn: () => Promise<boolean>) => {
    setBusy(which);
    try {
      await fn();
    } catch {
      Alert.alert('שגיאת התחברות', 'משהו השתבש, נסה שוב.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={S.center}>
      <Text style={{ fontSize: 56 }}>🎖️</Text>
      <Text style={[S.h1, { textAlign: 'center', fontSize: 30 }]}>{T.onboard.welcome}</Text>
      <Text style={[S.sub, { textAlign: 'center', marginBottom: 28 }]}>{T.onboard.sub}</Text>

      <View style={{ width: '100%' }}>
        {/* Google */}
        <Pressable
          style={[S.btn, busy && { opacity: 0.6 }]}
          disabled={!!busy}
          onPress={() => run('google', signInWithGoogle)}
        >
          {busy === 'google' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={S.btnTxt}>🟢  {T.onboard.google}</Text>
          )}
        </Pressable>

        {/* Apple — כפתור רשמי, iOS בלבד */}
        {isAppleAvailable() && (
          busy === 'apple' ? (
            <View style={[S.btn, { backgroundColor: '#000' }]}>
              <ActivityIndicator color="#fff" />
            </View>
          ) : (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={16}
              style={{ width: '100%', height: 52, marginTop: 12 }}
              onPress={() => run('apple', signInWithApple)}
            />
          )
        )}
      </View>

      {onGuest && (
        <Pressable style={[S.btnGhost, { width: '100%' }]} onPress={onGuest}>
          <Text style={S.btnTxtDark}>👀 כניסת אורח (תצוגה)</Text>
        </Pressable>
      )}

      <Text style={[S.sub, { textAlign: 'center', marginTop: 24, fontSize: 12 }]}>
        ההתחברות שומרת את הנתונים שלך בענן
      </Text>
    </View>
  );
}
