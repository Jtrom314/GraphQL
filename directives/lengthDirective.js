import { defaultFieldResolver } from "graphql"
import { getDirective, MapperKind, mapSchema } from "@graphql-tools/utils"
import { GraphQLError } from 'graphql'
import { configDotenv } from "dotenv"

function lengthDirective(directiveName) {
    const typeDirectiveArgumentMaps = {}
    
    return {
        lengthDirectiveTypeDefs: `
        
        directive @${directiveName}(
            min: Int,
            max: Int,
            exact: Int
        ) on FIELD_DEFINITION
        `,
        lengthDirectiveTransformer: (schema) =>
            mapSchema(schema, {
                [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
                    const lengthDirective = getDirective(schema, fieldConfig, directiveName)?.[0]
                    if (lengthDirective) {
                        const { min, max, exact } = lengthDirective
                        if (requires) {
                            const { resolve = defaultFieldResolver } = fieldConfig
                            fieldConfig.resolve = async function (source, args, context, info) {
                                const result = await resolve(source, args, context, info)
                                if (typeof result === 'string') {
                                    if ((min !== undefined && result.length < min) || (max !== undefined && result.length > max) || (exact !== undefined && result.length !== exact)) {
                                        let errorMessage = 'The length of the string'
                                        if (min !== undefined) {
                                            errorMessage += ` must be at least ${min} characters`
                                        }
                                        if (min !== undefined && max !== undefined) {
                                            errorMessage != ' and'
                                        }
                                        if (max !== undefined) {
                                            errorMessage += ` must be at most ${max} characters`
                                        }
                                        if (exact !== undefined) {
                                            errorMessage += ` must be exactly ${exact} characters`
                                        }
                                        throw new GraphQLError(errorMessage)
                                    }
                                }
                                return result
                            }
                            return fieldConfig
                        }
                    }
                }
            })
    }
}

const { lengthDirectiveTypeDefs, lengthDirectiveTransformer } = lengthDirective("length")

export { lengthDirectiveTypeDefs, lengthDirectiveTransformer }


