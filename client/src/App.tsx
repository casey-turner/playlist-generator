import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, } from 'react-router-dom'
import axios from 'axios'
import { nodeApi } from './services/axiosConfig'
import { getSpotifyAccessToken, logout, getUserProfile, spotifyApi } from './services/spotify'
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
      const playlist = boston.songs;
      console.log(boston.songs);
        playlist.map(function(element){
          console.log(element.title)
        })

      setResponse(boston.songs);
    })
    .catch((err) => {
        console.error(err);
    });
  };

  const createPlaylist = () => {
    spotifyApi.post(`/users/${profile.id}/playlists`, {
    name: 'My AI Generated Playlist'
    }).then((res) => {
      // if response status is 201, playlist created
      if (res.status === 201) {
        // for each song in the generate playlist response get the track uri
        let playlistSongIds = new Array();
        response.map((element) => { 
          console.log
          let song = element.title.replace(/\s+/g, '+');
          let artist = element.artist.replace(/\s+/g, '+');
          spotifyApi.get(`/search?q=track:${song}+artist:${artist}&type=track&offset=0&limit=1`)
            .then((res) => {
              playlistSongIds.push(res.data.tracks.items[0].uri);
              console.log(res.data.tracks.items[0].uri)
            }).then(() => {
              console.log('playlist', playlistSongIds);
              console.log('length', playlistSongIds.length);
              // if array of track uris is not empty, add tracks to playlist
              if (playlistSongIds.length > 0) { 
                console.log('here')
                spotifyApi.post(`/playlists/${res.data.id}/tracks`, {
                  uris: playlistSongIds
                }).then((res) => {
                  console.log(res)
                }).catch((err) => {
                  console.error(err)
                })
              }
            })
            .catch((err) => {
              console.error(err)
            });
          
            
        })



      }
      console.log(res)
    }).catch((err) => {
      console.error(err)
    })
  }

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

                      {response && (response.map((key) => {
                        return (
                          <div key={key.title}>
                            {key.title} by {key.artist}
                          </div>
                        )
                      }))}                   



                  </div>       
                  )}
                // button on onClick to hit spotifyAPI
                <button onClick={createPlaylist}>Generate Playlist</button>
              </>
            } />
          </Routes>
           
        </Router>  





        )}
    </div>
  )
}

export default App
 