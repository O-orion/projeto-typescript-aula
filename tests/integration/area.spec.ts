import jwt from 'jsonwebtoken'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import app from '../../src/app'
import { getJwtConfig } from '../../src/config/jwt.config'
import { appDataSource } from '../../src/database/appDataSource'

function gerarTokenAcesso() {
  const { access } = getJwtConfig()
  return jwt.sign(
    { sub: 'test-user-id', email: 'test@email.com', type: 'access' },
    access.secret,
    { expiresIn: access.expiresIn as any }
  )
}

const areaValida = {
  nome: 'Área de Teste',
  descricao: 'Descrição opcional',
  bioma: 'Floresta',
  latitude: -3.1,
  longitude: -60.0,
  largura: 100,
  comprimento: 200,
  relevo: 'Plano',
}

describe('Area Integration', () => {
  let token: string
  let areaCriadaId: string

  beforeAll(async () => {
    if (!appDataSource.isInitialized) {
      await appDataSource.initialize()
    }
    token = gerarTokenAcesso()
  })

  afterAll(async () => {
    if (appDataSource.isInitialized) {
      await appDataSource.destroy()
    }
  })

  describe('POST /api/area', () => {
    it('deve criar uma área com dados válidos', async () => {
      const res = await request(app)
        .post('/api/area')
        .set('Authorization', `Bearer ${token}`)
        .send(areaValida)

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('id')
      expect(res.body.nome).toBe(areaValida.nome)
      expect(res.body.bioma).toBe(areaValida.bioma)

      areaCriadaId = res.body.id
    })

    it('deve retornar 400 quando o nome for muito curto', async () => {
      const res = await request(app)
        .post('/api/area')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...areaValida, nome: 'AB' })

      expect(res.status).toBe(400)
    })

    it('deve retornar 400 quando o bioma for inválido', async () => {
      const res = await request(app)
        .post('/api/area')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...areaValida, bioma: 'Pantanal' })

      expect(res.status).toBe(400)
    })

    it('deve retornar 400 quando latitude estiver fora do range', async () => {
      const res = await request(app)
        .post('/api/area')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...areaValida, latitude: -91 })

      expect(res.status).toBe(400)
    })

    it('deve retornar 401 sem token', async () => {
      const res = await request(app).post('/api/area').send(areaValida)

      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/area', () => {
    it('deve retornar lista de áreas', async () => {
      const res = await request(app)
        .get('/api/area')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    it('deve retornar 401 sem token', async () => {
      const res = await request(app).get('/api/area')

      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/area/:id', () => {
    it('deve retornar a área pelo id', async () => {
      const res = await request(app)
        .get(`/api/area/${areaCriadaId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(200)
      expect(res.body.id).toBe(areaCriadaId)
    })

    it('deve retornar 404 para id inexistente', async () => {
      const res = await request(app)
        .get('/api/area/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(404)
    })

    it('deve retornar 401 sem token', async () => {
      const res = await request(app).get(`/api/area/${areaCriadaId}`)

      expect(res.status).toBe(401)
    })
  })

  describe('PUT /api/area/:id', () => {
    it('deve atualizar a área', async () => {
      const res = await request(app)
        .put(`/api/area/${areaCriadaId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ ...areaValida, nome: 'Área Atualizada' })

      expect(res.status).toBe(200)
      expect(res.body.nome).toBe('Área Atualizada')
    })

    it('deve retornar 404 para id inexistente', async () => {
      const res = await request(app)
        .put('/api/area/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...areaValida, nome: 'Área X' })

      expect(res.status).toBe(404)
    })

    it('deve retornar 401 sem token', async () => {
      const res = await request(app)
        .put(`/api/area/${areaCriadaId}`)
        .send({ ...areaValida, nome: 'Área X' })

      expect(res.status).toBe(401)
    })
  })

  describe('DELETE /api/area/:id', () => {
    it('deve deletar a área e retornar 204', async () => {
      const res = await request(app)
        .delete(`/api/area/${areaCriadaId}`)
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(204)
    })

    it('deve retornar 404 ao tentar deletar id inexistente', async () => {
      const res = await request(app)
        .delete('/api/area/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${token}`)

      expect(res.status).toBe(404)
    })

    it('deve retornar 401 sem token', async () => {
      const res = await request(app).delete(`/api/area/${areaCriadaId}`)

      expect(res.status).toBe(401)
    })
  })
})
