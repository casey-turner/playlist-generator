import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, } from 'react-router-dom'
import axios from 'axios'
import { nodeApi } from './services/axiosConfig'
import { getSpotifyAccessToken, logout, getUserProfile } from './services/spotify'
import './App.css'
import GeneratePlaylist from './pages/GeneratePlaylist'



function App() {
  
  const [token, setToken] = useState<string | null>(null)
  const [profile, setProfile] = useState<Promise | null>(null)

  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");  

  // send a POST request to the server with the prompt for chat gpt
  const generatePlaylist = (e) => {
    e.preventDefault();

    // Send a request to the server with the prompt
    console.log(prompt)
    axios
    .post("http://localhost:3000/generate", { prompt })
    .then((res) => {
        // Update the response state with the server's response
      console.log(res);
      const boston = JSON.parse(res.data.data);
      console.log(boston);
      setResponse(boston);
    })
    .catch((err) => {
        console.error(err);
    });
  };


  useEffect(() => { 
    setToken(getSpotifyAccessToken)

    const fetchData = async () => {
      try {
        const { data } = await getUserProfile();
        setProfile(data);
        console.log(data)
      } catch(e) {
        console.error(e);
      }
    };

    fetchData();

  }, [])

  return (
    <div className="App">
      {!token ? (
        <a href="http://localhost:3000/connect">
          Login to Spotify
        </a>
      ) : (

        <Router>
          <Routes>
            <Route path="/generate" element={<GeneratePlaylist />} />
            <Route index element={
              <>
                <h1>Logged In!</h1>
                <button onClick={logout}>Log Out</button>
                {profile && (
                  <div>
                    <h2>{profile.display_name}</h2>
                    {profile.images.length && profile.images[0].url && (
                      <img src={profile.images[0].url} alt="profile" />
                    )}
                    
                      <form onSubmit={generatePlaylist}>
                      <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                      <button type="submit">Submit</button>

                      </form>

                      {response && (Object.key(response).map((key) => {
                        return (
                          <div key={key}>
                            { key}
                          </div>
                        )
                      }))}
                    
        



                  </div>       
                  )}
              </>
            } />
          </Routes>
           
        </Router>  





        )}
    </div>
  )
}

export default App
 