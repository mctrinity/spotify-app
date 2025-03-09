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

app.use(express.urlencoded({ extended: true })); // Middleware to parse form data


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
  secret: process.env.SESSION_SECRET, // Load from .env
  resave: false,
  saveUninitialized: false, 
  cookie: { secure: false } // Set to true if using HTTPS
}));


// Basic route to render the page
app.get("/", async (req, res) => {
  const user = req.session.user; 
  const accessToken = req.session.access_token;

  if (!user || !accessToken) {
    return res.render("index.ejs", { user: null, playlists: null, content: "Welcome to Spotify API Integration!" });
  }

  try {
    // Fetch updated playlists to ensure `playlists` is always defined
    const playlistsResponse = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    req.session.playlists = playlistsResponse.data; // Store in session

    res.render("index.ejs", {
      user: user,
      playlists: playlistsResponse.data, // Pass playlists data
      content: "Welcome to Spotify API Integration!",
    });
  } catch (error) {
    console.error("Error fetching playlists:", error.response?.data || error.message);
    res.render("index.ejs", { user: user, playlists: null, content: "Error loading playlists." });
  }
});


// Step 1: Redirect user to Spotify's authorization page
app.get("/login", (req, res) => {
  const scopes = [
    "user-read-private",
    "user-read-email",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
    "playlist-modify-private"
  ].join("%20"); // Space-separated scopes
  
  const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scopes}`;
  
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

app.get('/add-playlist', (req, res) => {
  if (!req.session.access_token) return res.redirect('/login');
  res.render('add-playlist.ejs');
});

// Create Playlist
app.post("/create-playlist", async (req, res) => {
  const accessToken = req.session.access_token;

  if (!accessToken) {
    console.error("🚨 No access token found!");
    return res.status(401).json({ error: "Unauthorized - No access token found" });
  }

  try {
    const { name, description, isPublic } = req.body;

    // Step 1: Create the playlist
    const response = await axios.post(
      "https://api.spotify.com/v1/me/playlists",
      { name, description: description || "", public: isPublic === "true" },
      { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
    );

    console.log("✅ Playlist Created:", response.data);

    // Step 2: Fetch updated playlists after creation
    const updatedPlaylistsResponse = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    req.session.playlists = updatedPlaylistsResponse.data; // Store new playlists in session

    res.redirect("/");
  } catch (error) {
    console.error("🚨 Error creating playlist:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create playlist", details: error.response?.data });
  }
});

// Step 5: Start the Express server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
