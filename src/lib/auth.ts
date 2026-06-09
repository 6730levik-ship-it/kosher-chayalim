import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from './supabase';

const extra = (Constants.expoConfig?.extra ?? {}) as {
  googleWebClientId?: string;
  googleIosClientId?: string;
};

// קונפיגורציה חד-פעמית של Google Sign-In
GoogleSignin.configure({
  webClientId: extra.googleWebClientId, // חובה — ה-audience של ה-idToken עבור Supabase
  iosClientId: extra.googleIosClientId,
  scopes: ['profile', 'email'],
});

/**
 * התחברות Google נייטיבית — מקפיץ את חשבון המכשיר הקיים,
 * מקבל idToken ומחבר ל-Supabase. מחזיר true בהצלחה.
 */
export async function signInWithGoogle(): Promise<boolean> {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const res: any = await GoogleSignin.signIn();
    // תאימות בין גרסאות: v13+ מחזיר {data:{idToken}}, ישן יותר {idToken}
    const idToken = res?.data?.idToken ?? res?.idToken;
    if (!idToken) throw new Error('לא התקבל idToken מ-Google');

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) throw error;
    return true;
  } catch (e: any) {
    if (e?.code === statusCodes.SIGN_IN_CANCELLED) return false; // המשתמש ביטל
    console.warn('Google sign-in error:', e?.message ?? e);
    throw e;
  }
}

/**
 * התחברות Apple נייטיבית (iOS בלבד) — מקבל identityToken ומחבר ל-Supabase.
 */
export async function signInWithApple(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  try {
    const cred = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!cred.identityToken) throw new Error('לא התקבל identityToken מ-Apple');

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: cred.identityToken,
    });
    if (error) throw error;

    // Apple מספק שם רק בכניסה הראשונה — נשמור אותו לפרופיל
    if (cred.fullName?.givenName) {
      const fullName = [cred.fullName.givenName, cred.fullName.familyName]
        .filter(Boolean)
        .join(' ');
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await supabase.from('profiles').upsert({ id: data.user.id, name: fullName });
      }
    }
    return true;
  } catch (e: any) {
    if (e?.code === 'ERR_REQUEST_CANCELED') return false; // המשתמש ביטל
    console.warn('Apple sign-in error:', e?.message ?? e);
    throw e;
  }
}

/** האם Apple Sign-In זמין במכשיר */
export const isAppleAvailable = () => Platform.OS === 'ios';
