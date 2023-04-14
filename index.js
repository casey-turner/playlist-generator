import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import axios from 'axios';
import querystring from 'querystring';

const app = express();
const PORT = process.env.PORT || 3000; 
const URL = process.env.CLIENT_URL || 'http://localhost:5173';
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(express.json());


app.post('/playlist', async (req, res) => {

    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: "A 15 song playlist for a specific genre of music, output in JSON format. Genre: Punk. Playlist: {\"Track\": \"Blitzkrieg Bop\", \"Artist\": \"The Ramones\"}",
        temperature: 0.8,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
    });
    try {
        return res.status(200).json({
            success: true,  
            data: response.data.choices[0].text
        });
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
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
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
      scope: 'user-read-private user-read-email'
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
            Authorization: 'Basic ' + (new Buffer(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'))
        }
    }).then((response) => {
        if (response.status === 200) {
            // const { access_token, token_type } = response.data;

            const { access_token, token_type, refresh_token } = response.data;

            const queryParams = querystring.stringify({
                access_token,
                refresh_token
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
app.get("/refresh_token", (req, res) => { 
    const { refresh_token } = req.query;
    axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
        }
    }).then((response) => {
        res.send(response.data);
    }).catch((error) => {
        res.send(error);
    });
});


app.listen(PORT, () => console.log(`start running on port : http://localhost:${PORT}`));