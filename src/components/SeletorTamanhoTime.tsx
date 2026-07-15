import { StyleSheet } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';

import type { TamanhoTime } from '../domain/sorteio.types';

interface SeletorTamanhoTimeProps {
  value: TamanhoTime;
  onChange: (value: TamanhoTime) => void;
}

export function SeletorTamanhoTime({ value, onChange }: SeletorTamanhoTimeProps) {
  return (
    <SegmentedButtons
      value={String(value)}
      onValueChange={(v) => onChange(Number(v) as TamanhoTime)}
      buttons={[
        { value: '4', label: '4 por time' },
        { value: '5', label: '5 por time' },
        { value: '6', label: '6 por time' },
      ]}
      style={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 16, marginBottom: 16 },
});
