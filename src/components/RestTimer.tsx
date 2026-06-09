import { useEffect, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { C } from '../theme';
import { T } from '../i18n/he';

// טיימר מנוחה אוטומטי שקופץ בין הסטים
export default function RestTimer({
  seconds,
  onDone,
}: {
  seconds: number;
  onDone: () => void;
}) {
  const [s, setS] = useState(seconds);

  useEffect(() => {
    if (s <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setS((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [s]);

  return (
    <View
      style={{
        backgroundColor: C.accent,
        borderRadius: 20,
        padding: 22,
        marginTop: 16,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>
        {T.workout.rest}
      </Text>
      <Text style={{ color: '#fff', fontSize: 48, fontWeight: '900' }}>
        {s}″
      </Text>
      <Pressable onPress={onDone}>
        <Text style={{ color: '#fff', opacity: 0.9, marginTop: 4 }}>דלג</Text>
      </Pressable>
    </View>
  );
}
