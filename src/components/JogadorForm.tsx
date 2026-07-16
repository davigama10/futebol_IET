import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { z } from 'zod';

import type { Posicao } from '../domain/sorteio.types';
import { NivelSelector } from './NivelSelector';

const jogadorSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome do jogador'),
  nivel: z.string().refine(
    (v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= 5;
    },
    { message: 'Nível deve ser um número inteiro entre 1 e 5' }
  ),
  posicao: z.enum(['atacante', 'defensor']),
});

export type JogadorFormValues = z.infer<typeof jogadorSchema>;

interface JogadorFormProps {
  valoresIniciais?: { nome: string; nivel: number; posicao: Posicao };
  onSubmit: (values: { nome: string; nivel: number; posicao: Posicao }) => Promise<void> | void;
  enviando?: boolean;
  textoBotao?: string;
}

export function JogadorForm({
  valoresIniciais,
  onSubmit,
  enviando,
  textoBotao = 'Salvar',
}: JogadorFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<JogadorFormValues>({
    resolver: zodResolver(jogadorSchema),
    defaultValues: {
      nome: valoresIniciais?.nome ?? '',
      nivel: valoresIniciais ? String(valoresIniciais.nivel) : '3',
      posicao: valoresIniciais?.posicao ?? 'atacante',
    },
  });

  function handleFormSubmit(values: JogadorFormValues) {
    return onSubmit({ nome: values.nome.trim(), nivel: Number(values.nivel), posicao: values.posicao });
  }

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="nome"
        render={({ field: { value, onChange } }) => (
          <TextInput label="Nome" value={value} onChangeText={onChange} style={styles.input} />
        )}
      />
      {errors.nome && <HelperText type="error">{errors.nome.message}</HelperText>}

      <Text variant="bodyMedium" style={styles.label}>
        Nível de habilidade (1 a 5)
      </Text>
      <Controller
        control={control}
        name="nivel"
        render={({ field: { value, onChange } }) => (
          <View style={styles.input}>
            <NivelSelector value={Number(value)} onChange={(n) => onChange(String(n))} />
          </View>
        )}
      />
      {errors.nivel && <HelperText type="error">{errors.nivel.message}</HelperText>}

      <Text variant="bodyMedium" style={styles.label}>
        Função
      </Text>
      <Controller
        control={control}
        name="posicao"
        render={({ field: { value, onChange } }) => (
          <SegmentedButtons
            value={value}
            onValueChange={onChange}
            buttons={[
              { value: 'atacante', label: 'Atacante' },
              { value: 'defensor', label: 'Defensor' },
            ]}
            style={styles.input}
          />
        )}
      />

      <Button
        mode="contained"
        onPress={handleSubmit(handleFormSubmit)}
        loading={enviando}
        disabled={enviando}
        style={styles.botao}>
        {textoBotao}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  input: { marginBottom: 12 },
  label: { marginBottom: 8 },
  botao: { marginTop: 16 },
});
