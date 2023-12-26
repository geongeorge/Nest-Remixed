import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { getRemixHandler, broadcastOnReady, PUBLIC_PATH } from './remix'
import * as serveStatic from 'serve-static'

const PORT = parseInt(process.env.PORT || '3000', 10)

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.setGlobalPrefix('api')
  app.enableCors()

  const express = app.getHttpAdapter().getInstance()
  express.all('*', await getRemixHandler())

  express.use(serveStatic(PUBLIC_PATH, { index: false }))

  await app.init()

  app.listen(PORT).then(() => {
    console.log(`> Server ready on http://localhost:${PORT}`)

    broadcastOnReady()
  })

  return app
}

bootstrap()
// export default bootstrap
