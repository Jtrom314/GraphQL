import { authDirectiveTypeDefs } from "./directives/authDirective.js"

export const TYPE_DEFS = [
  authDirectiveTypeDefs,
  /* GraphQL */`
  type Game {
    id: ID!
    title: String!
    platform: [String!]!
    reviews: [Review!]
  }

  type Review @auth(requires: ADMIN) {
    id: ID!,
    rating: Int!
    content: String!,
    author: Author!,
    game: Game!
  }

  type Author {
    id: ID!,
    name: String!,
    verified: Boolean,
    reviews: [Review!]
  }

  type Query {
    reviews: [Review],
    review(id: ID!): Review,
    games: [Game],
    game(id: ID!): Game,
    authors: [Author],
    author(id: ID!): Author
  }

  input authorize @upper {
    username: String!
    password: String!
  }

  type Mutation {
    authenticate(input: authorize): String 
  }
  `
]