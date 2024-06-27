import { ApolloServer } from "@apollo/server"
import { expressMiddleware } from "@apollo/server/express4"

import express from 'express'
import http from 'http'
import cors from 'cors'

import schema from "./schema.js"

import { configDotenv } from "dotenv"

configDotenv()

console.log('ENV:', process.env.JWT_SECRET)

const PORT = 5000
const REFRESH_TOKENS = {}

const APP = express()
const HTTP_SERVER = http.createServer(APP)

const HTTP_STATUS_PLUGIN = {
  requestDidStart: () => ({
    willSendResponse: ({ response, errors }) => {
      if (errors && errors.length > 0) {
        response.http.status = 400
      }
    }
  })
}

const SERVER = new ApolloServer({ 
  schema,
  includeStacktraceInErrorResponses: false,
  formatError({ message, extensions }) {
    return {
      code: extensions.code,
      message: message,
    }
  },
  plugins: [HTTP_STATUS_PLUGIN]
})

await SERVER.start()

APP.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(SERVER, {
    context: async ({ req }) => ({ 
      headers: req.headers 
    })
  })
)

await new Promise((resolve) => HTTP_SERVER.listen({ port: PORT }, resolve))

console.log(`listening on port: ${ PORT }`)