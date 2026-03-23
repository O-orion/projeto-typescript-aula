import { z } from 'zod'

export const createAreaSchema = z.object({
  nome: z.preprocess(
    val => (val === undefined ? '' : val),
    z
      .string()
      .min(3, 'O nome deve ter no mínimo 3 caracteres')
      .max(100, 'O nome deve ter no máximo 100 caracteres')
  ),

  descricao: z.preprocess(
    val => (val === '' || val === null ? undefined : val),
    z.string().optional()
  ),

  bioma: z.preprocess(
    val => (val === undefined ? '' : val),
    z.enum(['Floresta', 'Deserto', 'Savana', 'Tundra', 'Aquático'], {
      message:
        'Bioma inválido. Escolha entre: Floresta, Deserto, Savana, Tundra ou Aquático',
    })
  ),

  latitude: z.preprocess(
    val => (val === undefined ? '' : val),
    z.coerce
      .number()
      .min(-90, 'Latitude deve estar entre -90 e 90')
      .max(90, 'Latitude deve estar entre -90 e 90')
  ),

  longitude: z.preprocess(
    val => (val === undefined ? '' : val),
    z.coerce
      .number()
      .min(-180, 'Longitude deve estar entre -180 e 180')
      .max(180, 'Longitude deve estar entre -180 e 180')
  ),

  largura: z.preprocess(
    val => (val === undefined ? '' : val),
    z.coerce.number().positive('A largura deve ser maior que 0')
  ),

  comprimento: z.preprocess(
    val => (val === undefined ? '' : val),
    z.coerce.number().positive('O comprimento deve ser maior que 0')
  ),

  relevo: z.preprocess(
    val => (val === '' || val === null ? undefined : val),
    z.string().optional()
  ),
})
