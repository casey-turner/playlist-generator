import React, { useState } from 'react'
import axios from 'axios'
import { Link, useParams, useNavigate } from 'react-router-dom'


const GeneratePlaylist = () => {
  const params = useParams();
  const navigate = useNavigate();
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");  
    
    // send a POST request to the server with the prompt for chat gpt
    const generatePlaylist = (e) => {
        e.preventDefault();

        // Send a request to the server with the prompt
        axios
        .post("/generate_playlist", { prompt })
        .then((res) => {
            // Update the response state with the server's response
            setResponse(res.data);
        })
        .catch((err) => {
            console.error(err);
        });
    };


    
  return (
    <div>
          <h1>Generate Playlist</h1>
          <form onSubmit={generatePlaylist}>
              <input type="text" name="prompt" placeholder="Enter a prompt" />
              <button type="submit">Generate Playlist</button>
          </form>
          <p>{response}</p>
      <button onClick={() => {
        navigate(-1)
      }}>Go Back</button>
    </div>
  )
}

export default GeneratePlaylist