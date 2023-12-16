import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { getRemixHandler, broadcastOnReady } from './remix'

const PORT = parseInt(process.env.PORT || '3000', 10)

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.setGlobalPrefix('api')
  app.enableCors()

  const express = app.getHttpAdapter().getInstance()
  express.all('*', await getRemixHandler())

  await app.init()

  app.listen(PORT).then(() => {
    console.log(`> Server ready on ${PORT}`)

    broadcastOnReady()
  })

  return app
}

bootstrap()
// export default bootstrap
