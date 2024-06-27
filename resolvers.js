import jwt from 'jsonwebtoken'

import db from './_db.js'

import { configDotenv } from "dotenv"

configDotenv()

const JWT_SECRET = process.env.JWT_SECRET || 'test'
const USERS = {
  "Jtrom" : {
    password: '123456',
    role: 'USER'
  }
}

export const RESOLVERS = {
  Query: {
    games() {
      return db.games
    },
    reviews() {
      return db.reviews
    },
    authors(parent, args, context) {
      console.log(context)
      return db.authors
    },
    game(parent, args, context) {
      return db.games.find((game) => game.id === args.id)
    },
    review(parent, args, context) {
      return db.reviews.find((review) => review.id === args.id)
    },
    author(parent, args, context) {
      return db.authors.find((author) => author.id === args.id)
    },
  },
  Game: {
    reviews(parent, args, content) {
      return db.reviews.filter((r) => r.game_id === parent.id)
    }
  },
  Author: {
    reviews(parent, args, content) {
      return db.reviews.filter((r) => r.author_id === parent.id)
    }
  },
  Review: {
    author(parent, args, content) {
      return db.authors.find((a) => a.id === parent.author_id)
    },
    game(parent, args, content) {
      return db.games.find((g) => g.id === parent.game_id)
    }
  },
  Mutation: {
    authenticate: (_, { name, password }) => {
      if (USERS[name] && USERS[name].password === password) {
        const PACKAGE = {
          name: name,
          role: USERS[name].role
        }
        return jwt.sign({ data: PACKAGE }, JWT_SECRET, { expiresIn: "30m"})
      } else {
        throw new Error("Invalid credentials")
      }
    } 
  }
}