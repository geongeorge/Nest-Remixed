import * as path from 'path'
import * as fs from 'fs'
import * as url from 'url'
import { RequestHandler, createRequestHandler } from '@remix-run/express'
import { broadcastDevReady, installGlobals } from '@remix-run/node'
import * as sourceMapSupport from 'source-map-support'

sourceMapSupport.install({
  retrieveSourceMap: function (source) {
    // get source file with the `file://` prefix
    const match = source.match(/^file:\/\/(.*)$/)
    if (match) {
      const filePath = url.fileURLToPath(source)
      return {
        url: source,
        map: fs.readFileSync(`${filePath}.map`, 'utf8'),
      }
    }
    return null
  },
})
installGlobals()

const BUILD_PATH = path.resolve('../remix/build/index.cjs')
const PUBLIC_PATH = path.resolve('../remix/public')
const VERSION_PATH = path.resolve('../remix/build/version.txt')

const isDev = process.env.NODE_ENV === 'development'

// Docs: https://remix.run/docs/en/main/guides/manual-mode

/**
 * @returns {ServerBuild}
 */
function reimportServer() {
  Object.keys(require.cache).forEach((key) => {
    if (key.startsWith(BUILD_PATH)) {
      delete require.cache[key]
    }
  })

  return require(BUILD_PATH)
}

/**
 * @param {ServerBuild} initialBuild
 */
async function createDevRequestHandler(initialBuild) {
  const watch = (await import('node-watch')).default
  let build = initialBuild
  async function handleServerUpdate() {
    // 1. re-import the server build
    build = await reimportServer()
    // 2. tell Remix that this app server is now up-to-date and ready
    broadcastDevReady(build)
  }

  watch(VERSION_PATH, () => {
    handleServerUpdate()
  })

  // wrap request handler to make sure its recreated with the latest build for every request
  return async (req, res, next) => {
    try {
      return createRequestHandler({
        build,
        mode: 'development',
      })(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

async function getRemixHandler() {
  const remixBuild = await reimportServer()
  const remixHandler = isDev
    ? await createDevRequestHandler(remixBuild)
    : createRequestHandler({ build: remixBuild })

  const handler: RequestHandler = async (req, res, next) => {
    // if the request is for the API, skip Remix and let Nest handle it
    if (
      req.originalUrl.startsWith('/api') ||
      req.originalUrl.startsWith('/build') ||
      req.originalUrl.startsWith('/assets')
    ) {
      return next()
    }

    return remixHandler(req, res, next)
  }

  return handler
}

async function broadcastOnReady() {
  if (isDev) {
    const build = await reimportServer()
    broadcastDevReady(build)
  }
}

export { getRemixHandler, broadcastOnReady, PUBLIC_PATH }
