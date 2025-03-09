# Spotify API Authentication and Authorization

This project demonstrates how to integrate Spotify's Web API into a Node.js application using **OAuth 2.0** for authentication and authorization. This allows users to access their Spotify account, including **user playlists**, **creating playlists**, and **account details**.

## Prerequisites

Before you begin, make sure you have the following:

1. **Spotify Developer Account**: Create a developer account on [Spotify for Developers](https://developer.spotify.com/).
2. **Spotify App Credentials**: Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications) to get your `Client ID` and `Client Secret`.
3. **Node.js & npm**: Make sure you have [Node.js](https://nodejs.org/en/) installed. You can download it from their website. npm (Node Package Manager) is included with Node.js.

## Setup

### 1. Install Dependencies

Clone the repository and run the following command to install the required dependencies:

```bash
npm install
```

The required dependencies include:
- `express`: Web framework for Node.js.
- `axios`: HTTP client to make requests to Spotify API.
- `qs`: Query string parser to handle OAuth 2.0 token exchanges.
- `dotenv`: Loads environment variables from a `.env` file.
- `express-session`: Session management to store user data and access tokens.

### 2. Configure Environment Variables

Create a `.env` file in the root of your project and add your Spotify **Client ID**, **Client Secret**, and **Redirect URI**:

```env
SPOTIFY_CLIENT_ID=your-client-id-here
SPOTIFY_CLIENT_SECRET=your-client-secret-here
SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

### 3. Running the Application

To run the application, use the following command:

```bash
npm start
```

or with **nodemon** for automatic reloading:

```bash
nodemon index.js
```

The app will start a server at [http://localhost:3000](http://localhost:3000).

## User Authentication & Access

Spotify **restricts API access** in development mode. To allow more users to access the app, you have two options:

### ✅ **Option 1: Add Specific Users (Developer Mode)**

If your app is in **developer mode**, only **whitelisted users** can access it. You can manually **add test users** in the **Spotify Developer Dashboard**:

#### **How to Add Users**
1. **Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)**  
2. Select your app.  
3. Click **"Users & Access"** in the left sidebar.  
4. Click **"Add User"** and enter their **Spotify email**.  
5. Click **"Save"** – now they can log in to your app!

### 🌍 **Option 2: Make the App Open to Everyone**

If you want **anyone** to use your app, you need to **submit it for Spotify App Review**.

#### **How to Submit for Review**
1. **Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)**  
2. Click on your app.  
3. Go to **"Settings"** and scroll down to **"App Status"**.  
4. Click **"Request Verification"** (or "Submit for Review").  
5. Fill out the form explaining:
   - What your app does.
   - Why you need access for all users.
   - What **Spotify API scopes** you’re requesting.
6. **Submit your request** and wait for approval (takes a few days).

Once approved, **any Spotify user** can log in and use your app!

## Features

### 1. Fetch User's Playlists

The app fetches all playlists owned or saved by the authenticated user.

```javascript
const playlistsResponse = await axios.get("https://api.spotify.com/v1/me/playlists", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

### 2. Create a New Playlist

Users can create new playlists using the API.

```javascript
const response = await axios.post(
  'https://api.spotify.com/v1/me/playlists',
  {
    name: "New Playlist",
    description: "A custom playlist created via API",
    public: true,
  },
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  }
);
```

### 3. Delete a Playlist (Coming Soon)

The feature to delete a playlist via the API will be added soon.

## Gitignore

Here is a `.gitignore` file you can use for this project:

```gitignore
# Node.js dependencies
node_modules/

# Environment variables
.env

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Dependency directories
jspm_packages/

# TypeScript compilation
dist/
build/

# Optional npm cache directory
.npm/

# Optional eslint cache
.eslintcache

# VS Code directory
.vscode/

# macOS
.DS_Store

# Windows
Thumbs.db

# IDEs and editors
.idea/
*.sublime-workspace
*.sublime-project
```

## Conclusion

This application allows you to authenticate with Spotify, fetch user data (like playlists and top tracks), and integrate the Spotify Web API into your Node.js applications. Make sure to securely store your **Client ID** and **Client Secret** and never expose them in public repositories.

If you want to **open your app to the public**, consider submitting it for **Spotify App Review**.

Let us know if you need further enhancements! 🚀
