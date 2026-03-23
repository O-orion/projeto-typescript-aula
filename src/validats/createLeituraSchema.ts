import { z } from 'zod'

export const createLeituraSchema = z.object({
  umidade: z.preprocess(
    val => (val === undefined ? '' : val),
    z.coerce
      .number()
      .min(0, 'A umidade mínima é 0%')
      .max(100, 'A umidade máxima é 100%')
  ),

  temperatura: z.preprocess(
    val => (val === undefined ? '' : val),
    z.coerce
      .number()
      .min(-50, 'A temperatura mínima permitida é -50°C')
      .max(100, 'A temperatura máxima permitida é 100°C')
  ),

  dataHora: z.coerce
    .date({
      message: 'Data e hora inválidas ou não preenchidas',
    })
    .refine(data => !isNaN(data.getTime()), 'Data e hora inválidas'),
})
