import { useEffect  } from 'react'
import './App.css'

function App() {
  useEffect(() => { 

    const urlParams = new URLSearchParams(window.location.search)
    const accessToken = urlParams.get('access_token')
    const refreshToken = urlParams.get('refresh_token') 
    if(refreshToken) {
      fetch('/refresh_token?refresh_token=' + refreshToken)
        .then(res => res.json())  
        .then(data => console.log(data))
        .catch(err => console.log(err))
    }
  }, [])
  
  return (
    <div className="App">
      <a href="http://localhost:3000/connect">Login to spotify</a>
    </div>
  )
}

export default App
