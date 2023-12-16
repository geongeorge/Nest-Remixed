import * as path from 'path'
import watch from 'node-watch'
import { RequestHandler, createRequestHandler } from '@remix-run/express'
import { broadcastDevReady } from '@remix-run/node'

const BUILD_PATH = path.resolve('../remix/build/index.cjs')
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
function createDevRequestHandler(initialBuild) {
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
    ? createDevRequestHandler(remixBuild)
    : createRequestHandler({ build: remixBuild })

  const handler: RequestHandler = async (req, res, next) => {
    // if the request is for the API, skip Remix and let Nest handle it
    if (req.originalUrl.startsWith('/api')) {
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

export { getRemixHandler, broadcastOnReady }
