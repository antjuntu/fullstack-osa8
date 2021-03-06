import React, {useState} from 'react'

const Authors = ({ show, result, editAuthor, token }) => {
  const [name, setName] = useState('')
  const [year, setYear] = useState('')

  const updateBirthyear = async (e) => {
    e.preventDefault()
    //console.log(name, year)
    await editAuthor({
      variables: {
        name,
        setBornTo: Number(year)
      }
    })

    setName('')
    setYear('')
  }

  if (!show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {result.data.allAuthors.map(a =>
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr> 
          )}
        </tbody>
      </table>
      {token &&
        <div>
          <h2>Set birthyear</h2>
          <form onSubmit={updateBirthyear}>
            <select value={name} onChange={(e) => setName(e.target.value)}>
              {result.data.allAuthors.map(a =>
                <option key={a.name} value={a.name}>{a.name}</option>
              )}
            </select>
            <div>
              born
              <input value={year} onChange={(e) => setYear(e.target.value)} type='number' />
            </div>
            <button type='submit'>update author</button>
          </form>
        </div>
      }
    </div>
  )
}

export default Authors