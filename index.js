import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import axios from 'axios';
import querystring from 'querystring';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000; 
const URL = process.env.CLIENT_URL || 'http://localhost:5173';
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

import { Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
// const response = await openai.createCompletion({
//   model: "text-davinci-003",
//   prompt:"A 15 song playlist for a specific genre of music, output in JSON format. Output example {\"Track\": \"Track Title\", \"Artist\": \"Artist Name\"}. The genre of music is post hardcore. There should  be no repeated artists. All songs should be from between 1990-1995. Provide 5 creative titles for the playlist. output these in a separate JSON object.",
//   max_tokens: 2048,
//   temperature: 0.5,
// });
// console.log(response.data.choices[0].text);





app.post('/generate', async (req, res) => {

  const prompt = req.body.prompt;

   const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt:"Create a 2 song " + prompt + " playlist. The playlist must be returned as a JSON object in the following format { \"songs\": [ { \"title\": \"Bohemian Rhapsody\", \"artist\": \"Queen\"} ] }" ,
      max_tokens: 300,
      temperature: 0.9,
   });
    try {
        return res.status(200).json({
            success: true,  
            data: response.data.choices[0].text
        });
      console.log(response.data.choices[0].text);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.response
                ? error.response.data
                : 'Server Error'
        });
    }
});





app.get("/", (req, res) => {
   res.send('Boston is running!!!!') 
});

/**
* Generate a random string containing numbers and letters
* @param  {number} length The length of the string
* @return {string} The generated string
*/

function generateRandomString(length) { 
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


// Connect endpoint to initiate the authorisation request to Spotify
const stateKey = 'spotify_auth_state';

app.get("/connect", (req, res) => {
    const state = generateRandomString(16);
    res.cookie(stateKey, state);

    res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      state: state,
      scope: 'user-read-private user-read-email playlist-modify-public playlist-modify-private'
    }));

});

// Callback endpoint to handle the response from Spotify
app.get("/callback", (req, res) => {
    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: querystring.stringify({
            grant_type: 'authorization_code',
            code: req.query.code,
            redirect_uri: SPOTIFY_REDIRECT_URI
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
             Authorization: `Basic ${new Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,

        }
    }).then((response) => {
        if (response.status === 200) {

            const { access_token, refresh_token, expires_in } = response.data;

            // const cookies = [
            //     { name: 'access_token', value: access_token, },
            //     { name: 'refresh_token', value: refresh_token, },
            //     { name: 'expires_in', value: expires_in, },
            // ];

            // cookies.forEach(({ name, value }) => {
            //     res.cookie(name, value, {
            //         httpOnly: true,
            //         secure: false,
            //     });
            // });

            const queryParams = querystring.stringify({
                access_token,
                refresh_token,
                expires_in
            });

            res.redirect(`${URL}/?${queryParams}`);
        } else {
            res.redirect(`${URL}/?${querystring.stringify({ error: 'invalid_token' })}`);
        }

    }).catch((error) => {
        res.send(error);
    });        
});

// Refresh token endpoint to retrieve the user's refreshed Access Token once the current one has expired
app.get('/refresh_token', (req, res) => {
  const { refresh_token } = req.query;

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${new Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
    },
  })
    .then(response => {
      res.send(response.data);
    })
    .catch(error => {
      res.send(error);
    });
});


app.listen(PORT, () => console.log(`start running on port : http://localhost:${PORT}`));