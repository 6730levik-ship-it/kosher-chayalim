import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ujpslhbxmrpvtmdujigy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_VZk3vlRnmnwDIvPUqPfFQQ_2zHwYPZ8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// בסיס למשיכת אנימציות Lottie On-Demand (לא נארז ב-bundle)
export const LOTTIE_CDN =
  SUPABASE_URL + '/storage/v1/object/public/lottie/';
