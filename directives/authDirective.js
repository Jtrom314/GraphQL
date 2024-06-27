import { defaultFieldResolver } from "graphql"
import { getDirective, MapperKind, mapSchema } from "@graphql-tools/utils"
import { GraphQLError } from 'graphql'
import { configDotenv } from "dotenv"

configDotenv()

import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'test'

function authDirective(directiveName, getUserFn) {
  const typeDirectiveArgumentMaps = {}

  return {
    authDirectiveTypeDefs: `
      enum Role {
        UNKNOWN
        USER
        ADMIN
      }

      directive @${directiveName}(
        requires: Role
      ) on OBJECT | FIELD_DEFINITION
    `,
    authDirectiveTransformer: (schema) =>
      mapSchema(schema, {
        [MapperKind.TYPE]: (type) => {
          const authDirective = getDirective(schema, type, directiveName)?.[0]
          if (authDirective) {
            typeDirectiveArgumentMaps[type.name] = authDirective;
          }
          return undefined;
        },
        [MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
          const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0] ?? typeDirectiveArgumentMaps[typeName];
          if (authDirective) {
            const { requires } = authDirective;
            if (requires) {
              const { resolve = defaultFieldResolver } = fieldConfig;
              fieldConfig.resolve = async function (source, args, context, info) {
                try {
                  const encoded = context.headers['x-token']
  
                  jwt.verify(encoded, JWT_SECRET)
  
                  const decoded = jwt.decode(encoded)
                  const token = decoded.data.role || "UNKNOWN"
  
                  const user = getUserFn(token)
                  if (!user.hasRole(requires)) {
                    throw new Error('You are not authorized to perform this action')
                  }
                  return resolve(source, args, context, info)
                } catch (error) {
                  throw new GraphQLError(error.message, {
                    extensions: {
                      code: 'FORBIDDEN'
                    }
                  })
                }
              };
              return fieldConfig
            }
          }
        },
      }),
  };
}

function getUser(token) {
  const roles = ["UNKNOWN", "USER", "ADMIN"]
  return {
    hasRole: (role) => {
      const tokenIndex = roles.indexOf(token)
      const roleIndex = roles.indexOf(role)
      return roleIndex >= 0 && tokenIndex >= roleIndex
    },
  }
}

const { authDirectiveTypeDefs, authDirectiveTransformer } = authDirective("auth", getUser);

export { authDirectiveTypeDefs, authDirectiveTransformer };
