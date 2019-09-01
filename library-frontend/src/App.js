import React, { useState } from 'react'
import { useQuery, useMutation, useApolloClient, useSubscription } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'

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
    author {
      name
      id
      born
      bookCount
    }
    id
    genres
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
      author {
        name
        id
        born
        bookCount
      }
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

const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

const ME = gql`
  {
    me {
      username
      favoriteGenre
    }
  }
`

const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      title
      published
      author {
        name
        id
        born
        bookCount
      }
      id
      genres
    }
  }
`

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)

  const resultAuthors = useQuery(ALL_AUTHORS)
  const resultBooks = useQuery(ALL_BOOKS)
  const [addBook] = useMutation(ADD_BOOK, {
    refetchQueries: [{ query: ALL_AUTHORS }, { query: ALL_BOOKS }]
  })
  const [editAuthor] = useMutation(EDIT_AUTHOR)
  const [login] = useMutation(LOGIN)
  const currentUser = useQuery(ME)

  const client = useApolloClient()

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded
      window.alert(`${addedBook.title} by ${addedBook.author.name} added`)
    }
  })

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    setPage('authors')
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token && <button onClick={() => setPage('add')}>add book</button>}
        {token && <button onClick={() => setPage('recommend')}>recommend</button>}
        {!token && <button onClick={() => setPage('login')}>login</button>}
        {token && <button onClick={logout}>logout</button>}
      </div>

      <Authors
        show={page === 'authors'}
        result={resultAuthors}
        editAuthor={editAuthor}
        token={token}
      />

      <Books
        show={page === 'books'}
        result={resultBooks}
      />

      <NewBook
        show={page === 'add'}
        addBook={addBook}
      />

      <Recommendations
        show={page === 'recommend'}
        currentUser={currentUser}
        resultBooks={resultBooks}
      />

      <LoginForm
        show={page === 'login'}
        login={login}
        setToken={(token) => setToken(token)}
        setPage={(page) => setPage(page)}
      />
    </div>
  )
}

export default App