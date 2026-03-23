// auth.spec.ts
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import app from '../../src/app'
import { appDataSource } from '../../src/database/appDataSource'

describe('Auth Integration', () => {
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

  it('deve fazer login com sucesso', async () => {
    const res = await request(app).post('/api/login').send({
      email: 'admin@email.com',
      senha: 'minimo8chars',
    })
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('tokens')
  })
})
