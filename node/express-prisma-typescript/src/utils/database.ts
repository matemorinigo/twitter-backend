import { PrismaClient } from '@prisma/client'
import 'dotenvrc'

//Sin asignarle el datasource se me rompio no se porque
export const db = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DOCKER_DATABASE_URL
    }
  }
})
