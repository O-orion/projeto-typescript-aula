import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import app from '../app.js'
import { appDataSource } from '../database/appDataSource.js'

describe('Auth Integration', () => {
  let _tokenAccess: string
  let tokenRefresh: string

  beforeAll(async () => {
    if (!appDataSource.isInitialized) {
      await appDataSource.initialize()
    }
  })

  afterAll(async () => {
    if (appDataSource.isInitialized) {
      await appDataSource.destroy()
    }
  })

  // - LOGIN --

  describe('POST /api/login', () => {
    it('deve fazer login com sucesso e retornar os tokens', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'admin@email.com',
        senha: 'minimo8chars',
      })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('tokenAccess')
      expect(res.body).toHaveProperty('tokenRefresh')
      expect(typeof res.body.tokenAccess).toBe('string')
      expect(typeof res.body.tokenRefresh).toBe('string')

      _tokenAccess = res.body.tokenAccess
      tokenRefresh = res.body.tokenRefresh
    })

    it('deve retornar 401 com email inexistente', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'naoexiste@email.com',
        senha: 'minimo8chars',
      })

      expect(res.status).toBe(401)
    })

    it('deve retornar 401 com senha incorreta', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'admin@email.com',
        senha: 'senhaerrada',
      })

      expect(res.status).toBe(401)
    })

    it('deve retornar 400 quando o body estiver vazio', async () => {
      const res = await request(app).post('/api/login').send({})

      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  // --- REFRESH --

  describe('POST /api/refresh', () => {
    it('deve retornar novos tokens com refreshToken válido', async () => {
      const res = await request(app).post('/api/refresh').send({
        refreshToken: tokenRefresh,
      })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('tokenAccess')
      expect(res.body).toHaveProperty('tokenRefresh')
      expect(typeof res.body.tokenAccess).toBe('string')
      expect(typeof res.body.tokenRefresh).toBe('string')

      // atualiza tokens para o teste de logout
      _tokenAccess = res.body.tokenAccess
      tokenRefresh = res.body.tokenRefresh
    })

    it('deve retornar 401 com refreshToken inválido', async () => {
      const res = await request(app).post('/api/refresh').send({
        refreshToken: 'token.invalido.aqui',
      })

      expect(res.status).toBe(401)
    })

    it('deve retornar 400 quando o body estiver vazio', async () => {
      const res = await request(app).post('/api/refresh').send({})

      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })

  // - LOGOUT --

  describe('POST /api/logout', () => {
    it('deve fazer logout com sucesso', async () => {
      const res = await request(app).post('/api/logout').send({
        refreshToken: tokenRefresh,
      })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('message')
    })

    it('deve retornar 401 ao tentar usar o refreshToken revogado no refresh', async () => {
      const res = await request(app).post('/api/refresh').send({
        refreshToken: tokenRefresh,
      })

      expect(res.status).toBe(401)
    })

    it('deve retornar 401 com refreshToken inválido no logout', async () => {
      const res = await request(app).post('/api/logout').send({
        refreshToken: 'token.invalido.aqui',
      })

      expect(res.status).toBe(401)
    })
  })
})
