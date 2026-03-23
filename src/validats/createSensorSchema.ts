import { z } from 'zod'

export const createSensorSchema = z.object({
  serialNumber: z.preprocess(
    val => (val === undefined ? '' : val),
    z.string().min(1, 'Serial Number é obrigatório')
  ),

  fabricante: z.preprocess(
    val => (val === undefined ? '' : val),
    z.string().min(1, 'Fabricante é obrigatório')
  ),

  modelo: z.preprocess(
    val => (val === undefined ? '' : val),
    z.string().min(1, 'Modelo é obrigatório')
  ),

  tipo: z.preprocess(
    val => (val === undefined ? '' : val),
    z.string().min(1, 'Tipo é obrigatório')
  ),

  status: z.preprocess(
    val => (val === undefined ? '' : val),
    z.enum(['Ativo', 'Inativo', 'Manutencao'], {
      message: 'Status inválido. Use: Ativo, Inativo ou Manutencao',
    })
  ),

  ipFixo: z.preprocess(
    val => (val === '' || val === null ? undefined : val),
    z.string().ipv4({ message: 'Formato de IPv4 inválido' }).optional()
  ),

  dataInstalacao: z.coerce.date({
    message: 'Data de instalação inválida',
  }),

  dataManutencao: z.preprocess(
    val => (val === '' || val === null ? undefined : val),
    z.coerce.date().optional()
  ),

  cicloLeitura: z.preprocess(
    val => (val === undefined ? '' : val),
    z.coerce.number().positive('O ciclo de leitura deve ser maior que 0')
  ),

  latitude: z.preprocess(
    val => (val === undefined ? '' : val),
    z.coerce.number().min(-90).max(90, 'Latitude inválida')
  ),

  longitude: z.preprocess(
    val => (val === undefined ? '' : val),
    z.coerce.number().min(-180).max(180, 'Longitude inválida')
  ),

  finalidade: z.preprocess(
    val => (val === '' || val === null ? undefined : val),
    z.string().optional()
  ),
})
