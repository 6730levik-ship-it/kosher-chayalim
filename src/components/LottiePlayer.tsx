import LottieView from 'lottie-react-native';

// נייטיב (iOS/Android) — נגן Lottie אמיתי
export default function LottiePlayer({ source }: { source: any }) {
  return <LottieView source={source} autoPlay loop style={{ width: '100%', height: 220 }} />;
}
