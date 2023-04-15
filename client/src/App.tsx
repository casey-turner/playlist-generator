import { useEffect, useState } from 'react'
import { accessToken, logout } from './services/spotify'
import './App.css'

function App() {
  
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => { 
    setToken(accessToken)
  }, [])

  return (
    <div className="App">
      {!token ? (
        <a href="http://localhost:3000/connect">
          Login to Spotify
        </a>
      ) : (
          <>
            <h1>Logged In!</h1>
            <button onClick={logout}>Log Out</button>
          </>

        )}
    </div>
  )
}

export default App
 