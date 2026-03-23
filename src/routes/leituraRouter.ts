import { Router } from 'express'
import LeituraController from '../controllers/LeituraController'
import { validarBody } from '../middleware/validarBody'
import LeituraService from '../services/LeituraService'
import { createLeituraSchema } from '../validats/createLeituraSchema'

const leituraRoutes = Router()
const leituraService = new LeituraService()
const leituraController = new LeituraController(leituraService)

leituraRoutes.post('/leitura', validarBody(createLeituraSchema), (req, res) =>
  leituraController.create(req, res)
)
leituraRoutes.get('/leitura', (req, res) => leituraController.findAll(req, res))
leituraRoutes.get('/leitura/:id', (req, res) =>
  leituraController.findById(req, res)
)
leituraRoutes.put('/leitura/:id', (req, res) =>
  leituraController.update(req, res)
)
leituraRoutes.delete('/leitura/:id', (req, res) =>
  leituraController.delete(req, res)
)
leituraRoutes.get('/leitura/area/:areaId', (req, res) =>
  leituraController.listarLeiturasPorArea(req, res)
)

export default leituraRoutes
