import { createElement, useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Icon from './Icon';
import { C } from '../theme';

const H = 230;

// web — וידאו אמיתי בלופ (autoplay, muted). אם אין וידאו → תמונה. אחרת fallback נקי.
export default function ExerciseClip({
  url,
  image,
  name,
}: {
  url?: string | null;
  image?: string | null;
  name: string;
}) {
  const [err, setErr] = useState(false);
  useEffect(() => setErr(false), [url]);

  // וידאו זמין
  if (url && !err) {
    const video = createElement('video', {
      src: url,
      autoPlay: true,
      loop: true,
      muted: true,
      playsInline: true,
      onError: () => setErr(true),
      style: { width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#fff' },
    });
    return <View style={{ height: H, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' }}>{video}</View>;
  }

  // אין וידאו → תמונה
  if (image) {
    const img = createElement('img', {
      src: image,
      style: { width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#fff' },
    });
    return <View style={{ height: H, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' }}>{img}</View>;
  }

  return <Placeholder name={name} />;
}

function Placeholder({ name }: { name: string }) {
  return (
    <View style={{ height: H, borderRadius: 12, backgroundColor: '#F2F4EC', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.line }}>
      <Icon name="train" color={C.accent} size={44} />
      <Text style={{ color: C.ink, fontWeight: '800', fontSize: 16, marginTop: 10 }}>{name}</Text>
      <Text style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>קליפ תנועה יתווסף בקרוב</Text>
    </View>
  );
}
