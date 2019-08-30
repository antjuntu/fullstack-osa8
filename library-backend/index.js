const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')

const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')

const { password, jwt_secret } = require('./secret')
const MONGODB_URI = `mongodb+srv://antti:${password}@cluster0-nb9xg.mongodb.net/library-backend?retryWrites=true&w=majority`

mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
console.log('connecting to', MONGODB_URI)
mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connectiong to MongoDB', error.message)
  })


const typeDefs = gql`
  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(
      author: String
      genre: String
    ): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book!
    editAuthor(
      name: String!
      setBornTo: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      // args.author did not need to be implemented
      let books
      if (args.genre) {
        books = await Book.find({ genres: { $in: [args.genre] } })
      } else {
         books = await Book.find({})
      }
      return books
    },
    allAuthors: () => {
      return Author.find({})
    },
    me: (root, args, context) => context.currentUser
  },
  Author: {
    bookCount: async (root) => {
      const books = await Book.find({}).populate('author')
      
      const total = books.reduce((acc, current) => {
        if (current.author.name === root.name) {
          return acc + 1
        }
        return acc
      }, 0)
      return total
    }
  },
  Book: {
    author: async (root) => {
      const author = await Author.findById(root.author)
      return author
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
      const book = new Book({
        title: args.title,
        published: args.published,
        genres: args.genres
      })

      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }
      
      try{
        let author = await Author.findOne({ name: args.author })
        
        if (!author) {
          author = new Author({
            name: args.author
          })

          await author.save()
        }
        
        book.author = author

        await book.save()
      } catch(error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
      return book
    },
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

      let author
      try {
        author = await Author.findOne({ name: args.name })

        if (!author) {
          return null
        }

        author.born = args.setBornTo

        await author.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
      
      return author
    },
    createUser: (root, args) => {
      const user = new User({ ...args })

      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secret') {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id
      }

      return {
        value: jwt.sign(userForToken, jwt_secret)
      }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), jwt_secret
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Sever ready at ${url}`)
})