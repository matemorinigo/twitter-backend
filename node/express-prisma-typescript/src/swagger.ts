import swaggerJsDoc from 'swagger-jsdoc'
import { SignupInputDTO, token, validationError } from '@swagger.schemas';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Twitter Backend API',
      description: 'API for managing posts, users and followers',
      version: '1.0.0'
    }
  },
  components: {
    schemas: {
      SignupInputDTO,
      token,
      validationError
    }
  },
  apis: [`${__dirname}/domains/*/controller/*.controller.ts`]
}

//apis: ['./domains/auth/controller/auth.controller.ts']
export const specification = swaggerJsDoc(options)
