import { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useEvent } from 'expo';
import Icon from './Icon';
import { C } from '../theme';

const H = 230;

// נגן הדגמת תרגיל: וידאו (אם יש) → תמונה (אם יש) → fallback נקי.
export default function ExerciseClip({
  url,
  image,
  name,
}: {
  url?: string | null;
  image?: string | null;
  name: string;
}) {
  const player = useVideoPlayer(null, (p) => {
    p.loop = true;
    p.muted = true;
  });

  useEffect(() => {
    if (!url) return;
    try {
      player.replace(url);
      player.play();
    } catch {}
  }, [url]);

  const { status } = useEvent(player, 'statusChange', { status: player.status });
  const videoFailed = !url || status === 'error';

  const box = {
    height: H,
    borderRadius: 12,
    overflow: 'hidden' as const,
    backgroundColor: '#F2F4EC',
    borderWidth: 1,
    borderColor: C.line,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  };

  // וידאו זמין
  if (!videoFailed) {
    return (
      <View style={box}>
        <VideoView player={player} style={{ width: '100%', height: H }} contentFit="cover" nativeControls={false} />
      </View>
    );
  }

  // אין וידאו → תמונה
  if (image) {
    return (
      <View style={box}>
        <Image source={{ uri: image }} style={{ width: '100%', height: H }} resizeMode="contain" />
      </View>
    );
  }

  // fallback נקי
  return (
    <View style={box}>
      <Icon name="train" color={C.accent} size={44} />
      <Text style={{ color: C.ink, fontWeight: '800', fontSize: 16, marginTop: 10 }}>{name}</Text>
      <Text style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>קליפ תנועה יתווסף בקרוב</Text>
    </View>
  );
}
