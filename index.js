import express from 'express';
import axios from 'axios';
import qs from 'qs';
import dotenv from 'dotenv';
import session from 'express-session'; // For session handling
import path from 'path'; // For setting up the views directory
import { fileURLToPath } from 'url'; // For handling __dirname in ES Modules

dotenv.config();

const app = express();
const port = 3000;

// Spotify API credentials from .env
const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Set the path to the views directory

// Serve static files (CSS, images, JS, etc.) from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Set up session middleware to store access token and user data
app.use(session({
  secret: 'your_secret_key', // Replace with a stronger secret key
  resave: false,
  saveUninitialized: true,
}));

// Basic route to render the page
app.get("/", (req, res) => {
  // Ensure `user` data is available to pass to the EJS template
  const user = req.session.user; // Retrieve user data from session
  res.render("index.ejs", { user: user, content: "Welcome to Spotify API Integration!" });
});

// Step 1: Redirect user to Spotify's authorization page
app.get("/login", (req, res) => {
  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=user-library-read user-top-read`;
  res.redirect(spotifyAuthUrl);
});

// Step 2: Callback route to handle the authorization code and exchange it for an access token
app.get("/callback", async (req, res) => {
  const code = req.query.code; // The code sent by Spotify to your redirect URI

  try {
    // Step 3: Exchange the authorization code for an access token
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      qs.stringify({
        code: code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(clientId + ":" + clientSecret).toString("base64")}`,
        },
      }
    );

    const accessToken = response.data.access_token;
    const refreshToken = response.data.refresh_token;

    // Log the access token for debugging purposes
    console.log("Access Token:", accessToken);

    // Step 4: Use the access token to fetch user data (e.g., top tracks, playlists)
    const userData = await axios.get("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Fetch the user's playlists
    const playlistsResponse = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("User Playlists Response:", playlistsResponse.data); // Log playlists data

    // Store the tokens, user data, and playlists data in the session
    req.session.access_token = accessToken;
    req.session.refresh_token = refreshToken;
    req.session.user = userData.data;
    req.session.playlists = playlistsResponse.data; // Store playlists data in session

    // Render the index.ejs template with the user data and playlists
    res.render("index.ejs", {
      user: userData.data,  // Pass user data
      playlists: playlistsResponse.data,  // Pass playlists data
      content: "Successfully authenticated with Spotify!",
    });
  } catch (error) {
    console.error("Error during callback", error);
    res.status(500).send("Error during authentication");
  }
});



// Example of using the access token to fetch a user's top tracks
app.get("/top-tracks", async (req, res) => {
  const { access_token } = req.session; // Retrieve access token from session

  if (!access_token) {
    return res.redirect("/login"); // Redirect to login if not authenticated
  }

  try {
    const topTracks = await axios.get("https://api.spotify.com/v1/me/top/artists", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    res.json(topTracks.data);
  } catch (error) {
    console.error("Error fetching top tracks", error);
    res.status(500).send("Failed to fetch top tracks");
  }
});

// Step 5: Start the Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
