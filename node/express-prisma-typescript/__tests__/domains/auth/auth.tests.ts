import { app, server } from '@server';
import request from 'supertest';


const api = request(app);

describe('auth', () => {
  describe('post signup route', () => {
    describe('given valid credentials', () => {
      it('should return a 201, and a valid token', async () => {
        await api
          .post('/api/auth/signup')
          .send({
            email: 'example@example.com',
            username: 'example',
            password: '12345Aa!'
          })
          .expect(201)
          .expect('Content-Type', /json/);
      })
    })
  })
})

afterAll(() => {
  server.close()
})
