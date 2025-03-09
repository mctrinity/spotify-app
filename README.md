# Spotify API Authentication and Authorization

This project demonstrates how to integrate Spotify's Web API into a Node.js application using **OAuth 2.0** for authentication and authorization. This allows you to access data from the authenticated user's Spotify account, including **user playlists**, **top tracks**, and **account details**.

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

The app will start a server at [http://localhost:3000](http://localhost:3000).

### 4. Spotify Authorization Flow

The app uses **OAuth 2.0** to authenticate users and gain access to their Spotify data. The flow is as follows:

1. **User Login**: When the user navigates to [http://localhost:3000/login](http://localhost:3000/login), they will be redirected to Spotify's authorization page where they can log in and authorize the app to access their data.

2. **Spotify Redirect**: Once the user grants permission, Spotify will redirect them back to the app’s callback URL (`/callback`) with an authorization code.

3. **Exchange Authorization Code for Access Token**: The app will exchange the authorization code for an **access token** by making a POST request to the Spotify Accounts API.

4. **Access Spotify API**: The access token is used to make authenticated requests to Spotify's API. The app fetches the user's **profile data**, **playlists**, and **top tracks** using the `access_token`.

### 5. Example API Calls

#### Fetch User's Playlists:

The `/v1/me/playlists` endpoint is used to fetch all playlists owned or saved by the authenticated user.

```javascript
const playlistsResponse = await axios.get("https://api.spotify.com/v1/me/playlists", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

#### Fetch User's Top Tracks:

The `/v1/me/top/tracks` endpoint is used to fetch the authenticated user's top tracks.

```javascript
const topTracksResponse = await axios.get("https://api.spotify.com/v1/me/top/tracks", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});
```

### 6. Gitignore

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

## Using **nodemon** for Automatic Server Restarts

To use **nodemon** for automatically restarting your server during development, follow the steps below:

### 1. Install nodemon

If you haven't installed **nodemon**, you can do so globally or locally.

- To install globally (so you can use nodemon in any project):

```bash
npm install -g nodemon
```

- To install **locally** (recommended for specific projects):

```bash
npm install --save-dev nodemon
```

### 2. Use nodemon to Start Your Server

Once **nodemon** is installed, use the following command to start your server with automatic restarts:

```bash
npx nodemon index.js
```

Or, if you installed it globally:

```bash
nodemon index.js
```

### 3. Add a Start Script for Easy Execution

You can add **nodemon** to your `package.json` to simplify running it:

```json
"scripts": {
  "start": "nodemon index.js"
}
```

Then, you can run the app with:

```bash
npm start
```

### 4. Customizing nodemon

You can also create a `nodemon.json` file to customize **nodemon's** behavior, such as specifying which files to watch and which extensions to trigger restarts.

```json
{
  "watch": ["index.js", "routes"],
  "ext": "js,json"
}
```

This will make **nodemon** watch only specific files and extensions for changes.

## Conclusion

This application allows you to authenticate with Spotify, fetch user data (like playlists and top tracks), and integrate the Spotify Web API into your Node.js applications. Make sure to securely store your **Client ID** and **Client Secret** and never expose them in public repositories.

