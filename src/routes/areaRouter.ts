import { Router } from 'express'
import AreaController from '../controllers/AreaController'
import { validarBody } from '../middleware/validarBody'
import AreaService from '../services/AreaService'
import { createAreaSchema } from '../validats/createAreaSchema'

const areaRoutes = Router()
const areaService = new AreaService()
const areaController = new AreaController(areaService)

areaRoutes.post('/area', validarBody(createAreaSchema), (req, res) =>
  areaController.create(req, res)
)
areaRoutes.get('/area', (req, res) => areaController.findAll(req, res))
areaRoutes.get('/area/:id', (req, res) => areaController.findById(req, res))
areaRoutes.put('/area/:id', (req, res) => areaController.update(req, res))
areaRoutes.delete('/area/:id', (req, res) => areaController.delete(req, res))
areaRoutes.get('/area/sensor/:id', (req, res) =>
  areaController.sensoresAtivos(req, res)
)
export default areaRoutes
