import React, { useState } from 'react'

const Books = ({ show, result }) => {
  const [genre, setGenre] = useState('')

  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  const showBooks = () => {
    if (genre === '') {
      return result.data.allBooks
    }
    return result.data.allBooks.filter(book => book.genres.includes(genre))
  }

  const allGenres = () => {
    return result.data.allBooks.reduce((acc, current) => {
      current.genres.forEach(genre => {
        if (!acc.includes(genre)) {
          acc.push(genre)
        }
      })
      return acc
    }, [])
  }

  //console.log('allGenres', allGenres())


  return (
    <div>
      <h2>books</h2>
      <div>in genre {genre === '' ? 'all' : genre}</div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {showBooks().map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
      <div>
        {allGenres().map(g => 
          <button key={g} onClick={() => setGenre(g)}>{g}</button>
        )}
        <button onClick={() => setGenre('')}>all</button>
      </div>
    </div>
  )
}

export default Books