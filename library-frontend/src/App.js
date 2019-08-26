import React, { useState } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'

const ALL_AUTHORS = gql`
{
  allAuthors {
    name
    id
    born
    bookCount
  }
} 
`

const ALL_BOOKS = gql`
{
  allBooks {
    title
    published
    author
    id
  }
}
`

const ADD_BOOK = gql`
  mutation addBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
    addBook(
      title: $title,
      author: $author,
      published: $published,
      genres: $genres
    ) {
      title
      published
      author
      id
      genres
    }
  }
`

const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(
      name: $name,
      setBornTo: $setBornTo
    ) {
      name
      id
      born
      bookCount
    }
  }
`

const App = () => {
  const [page, setPage] = useState('authors')

  const resultAuthors = useQuery(ALL_AUTHORS)
  const resultBooks = useQuery(ALL_BOOKS)
  const [addBook] = useMutation(ADD_BOOK, {
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS }]
  })
  const [editAuthor] = useMutation(EDIT_AUTHOR)

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors
        show={page === 'authors'}
        result={resultAuthors}
        editAuthor={editAuthor}
      />

      <Books
        show={page === 'books'}
        result={resultBooks}
      />

      <NewBook
        show={page === 'add'}
        addBook={addBook}
      />

    </div>
  )
}

export default App