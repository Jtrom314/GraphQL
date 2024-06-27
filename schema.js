import { makeExecutableSchema } from "@graphql-tools/schema"
import { TYPE_DEFS } from "./typeDefs.js"
import { RESOLVERS } from "./resolvers.js"
import { authDirectiveTransformer } from "./directives/authDirective.js"


let schema = makeExecutableSchema({
  typeDefs: TYPE_DEFS,
  resolvers: RESOLVERS
})

schema = authDirectiveTransformer(schema)

export default schema