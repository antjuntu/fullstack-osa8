import React from 'react'

const Recommendations = ({ show, currentUser, resultBooks }) => {
  //console.log('currentUser', currentUser)
  //console.log('resultBooks', resultBooks)

  if (!show) {
    return null
  }

  if (currentUser.loading || resultBooks.loading) {
    return <div>loading...</div>
  }

  const booksAtFavoriteGenre = () => resultBooks.data.allBooks.filter(book => 
    book.genres.includes(currentUser.data.me.favoriteGenre)
  )

  return (
    <div>
      <h2>Recommendations</h2>
      <div>books in your favorite genre {currentUser.data.me.favoriteGenre}</div>
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
          {booksAtFavoriteGenre().map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations