import { Router } from 'express'
import PesquisadorController from '../controllers/PesquisadorController'
import { validarBody } from '../middleware/validarBody'
import PesquisadorService from '../services/PesquisadorService'
import { createPesquisadorSchema } from '../validats/createPesquisadorSchema'

const pesquisadorRoutes = Router()
const pesquisadorService = new PesquisadorService()
const pesquisadorController = new PesquisadorController(pesquisadorService)

pesquisadorRoutes.post(
  '/pesquisador',
  validarBody(createPesquisadorSchema),
  (req, res) => pesquisadorController.create(req, res)
)
pesquisadorRoutes.post(
  '/register',
  validarBody(createPesquisadorSchema),
  (req, res) => pesquisadorController.create(req, res)
)
pesquisadorRoutes.get('/pesquisador', (req, res) =>
  pesquisadorController.findAll(req, res)
)
pesquisadorRoutes.get('/pesquisador/:id', (req, res) =>
  pesquisadorController.findById(req, res)
)
pesquisadorRoutes.put('/pesquisador/:id', (req, res) =>
  pesquisadorController.update(req, res)
)
pesquisadorRoutes.delete('/pesquisador/:id', (req, res) =>
  pesquisadorController.delete(req, res)
)

export default pesquisadorRoutes
