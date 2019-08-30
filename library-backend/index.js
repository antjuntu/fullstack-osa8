const { ApolloServer, gql } = require('apollo-server')
const mongoose = require('mongoose')

const Book = require('./models/book')
const Author = require('./models/author')

const { password } = require('./secret')
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

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(
      author: String
      genre: String
    ): [Book!]!
    allAuthors: [Author!]!
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
    }
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
    addBook: async (root, args) => {
      const book = new Book({
        title: args.title,
        published: args.published,
        genres: args.genres
      })
      
      let author = await Author.findOne({ name: args.author })
      
      if (!author) {
        author = new Author({
          name: args.author
        })

        await author.save()
      }
      
      book.author = author

      await book.save()
      return book
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })

      if (!author) {
        return null
      }

      author.born = args.setBornTo

      await author.save()
      return author
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers
})

server.listen().then(({ url }) => {
  console.log(`Sever ready at ${url}`)
})