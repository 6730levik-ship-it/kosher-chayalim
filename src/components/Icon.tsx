import Svg, { Circle, Line, Rect, Path } from 'react-native-svg';

type Name = 'run' | 'train' | 'food' | 'me';

// אייקונים וקטוריים נקיים בסגנון קו (stroke) — ללא אימוג'י, ללא תלות בקבצים
export default function Icon({ name, color, size = 24 }: { name: Name; color: string; size?: number }) {
  const sw = 2;
  const common = { stroke: color, strokeWidth: sw, fill: 'none' as const, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'run' && (
        <>
          {/* שעון עצר — שעון הריצה */}
          <Line x1="10" y1="2.5" x2="14" y2="2.5" {...common} />
          <Line x1="12" y1="2.5" x2="12" y2="4.5" {...common} />
          <Circle cx="12" cy="13.5" r="7.5" {...common} />
          <Line x1="12" y1="13.5" x2="15" y2="10.5" {...common} />
        </>
      )}
      {name === 'train' && (
        <>
          {/* משקולת */}
          <Rect x="2.5" y="8" width="3" height="8" rx="1" {...common} />
          <Rect x="18.5" y="8" width="3" height="8" rx="1" {...common} />
          <Line x1="5.5" y1="12" x2="18.5" y2="12" {...common} />
          <Line x1="7.5" y1="9.5" x2="7.5" y2="14.5" {...common} />
          <Line x1="16.5" y1="9.5" x2="16.5" y2="14.5" {...common} />
        </>
      )}
      {name === 'food' && (
        <>
          {/* תפוח — תזונה */}
          <Path d="M12 8c-3 0-5.5 2.2-5.5 6S9 21 12 21s5.5-3.2 5.5-7S15 8 12 8z" {...common} />
          <Path d="M12 8c0-2.2 1.4-3.6 3.6-3.6" {...common} />
        </>
      )}
      {name === 'me' && (
        <>
          {/* פרופיל חייל */}
          <Circle cx="12" cy="8" r="3.4" {...common} />
          <Path d="M5.5 20a6.5 6.5 0 0 1 13 0" {...common} />
        </>
      )}
    </Svg>
  );
}
