import { View, Text } from 'react-native';
import { C } from '../theme';

// web — נגן Lottie הנייטיבי לא נתמך; חלופת תצוגה (לא נוגע ב-lottie-react-native)
export default function LottiePlayer({ source }: { source?: any }) {
  return (
    <View style={{ height: 220, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 64 }}>🏋️</Text>
      <Text style={{ color: C.sub, marginTop: 8 }}>אנימציית תרגיל (מוצגת במכשיר)</Text>
    </View>
  );
}
