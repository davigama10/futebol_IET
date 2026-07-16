import { Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface NivelSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

const NIVEIS = [1, 2, 3, 4, 5];

export function NivelSelector({ value, onChange }: NivelSelectorProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {NIVEIS.map((nivel) => {
        const selecionado = nivel === value;
        return (
          <Pressable
            key={nivel}
            onPress={() => onChange(nivel)}
            style={[
              styles.chip,
              {
                backgroundColor: selecionado ? theme.colors.primary : 'transparent',
                borderColor: theme.colors.primary,
              },
            ]}>
            <Text
              variant="titleMedium"
              style={{ color: selecionado ? theme.colors.onPrimary : theme.colors.primary }}>
              {nivel}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between' },
  chip: {
    flex: 1,
    marginHorizontal: 4,
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
