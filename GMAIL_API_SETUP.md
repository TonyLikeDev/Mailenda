# Gmail API Setup Guide

This guide will walk you through setting up Gmail API authentication for your AI Calendar application.

## Prerequisites
- A Google Cloud Platform account
- A Gmail account

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "AI Calendar")
5. Click "Create"

### 2. Enable Gmail API

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for "Gmail API"
3. Click on "Gmail API"
4. Click "Enable"

### 3. Configure OAuth Consent Screen

1. Go to "APIs & Services" > "OAuth consent screen"
2. Select "External" user type
3. Click "Create"
4. Fill in the required fields:
   - App name: "AI Calendar"
   - User support email: Your email
   - Developer contact information: Your email
5. Click "Save and Continue"
6. On the Scopes page, click "Add or Remove Scopes"
7. Add the following scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/calendar.readonly`
8. Click "Update" and then "Save and Continue"
9. Add test users (your Gmail account)
10. Click "Save and Continue"

### 4. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Select "Web application"
4. Enter a name (e.g., "AI Calendar Web Client")
5. Under "Authorized JavaScript origins", add:
   - `http://localhost:8000` (for local testing)
   - `http://127.0.0.1:8000` (for local testing)
   - Add your production domain if deploying
6. Under "Authorized redirect URIs", add:
   - `http://localhost:8000` (for local testing)
   - Your production domain if deploying
7. Click "Create"
8. **Copy the Client ID** - you'll need this!

### 5. Create API Key

1. Still in "Credentials", click "Create Credentials" > "API Key"
2. **Copy the API Key** - you'll need this!
3. (Optional) Click "Restrict Key" to limit the key to Gmail API only

### 6. Update Your Code

1. Open `script.js`
2. Replace the following values at the top of the file:

```javascript
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';
const API_KEY = 'YOUR_API_KEY_HERE';
```

Replace with your actual Client ID and API Key.

### 7. Test Locally

1. You need to serve the files over HTTP (not file://)
2. Use Python's built-in server:
   ```bash
   # Python 3
   python3 -m http.server 8000
   
   # Or Python 2
   python -m SimpleHTTPServer 8000
   ```
3. Open your browser to `http://localhost:8000`
4. Click "Sign in with Google"
5. Authorize the application
6. You should see the calendar and to-do list interface

## Troubleshooting

### "Origin Mismatch" Error
- Make sure you've added the correct origin in OAuth credentials
- Use the exact same URL (including port) that appears in your browser

### "Access Blocked: This app's request is invalid"
- Complete the OAuth consent screen configuration
- Add your email as a test user
- Make sure you're using the correct Client ID

### Files Not Loading
- Make sure you're using an HTTP server (not opening files directly)
- Check browser console for CORS errors
- Verify all file paths are correct

## Security Notes

⚠️ **Important**: 
- Never commit your Client ID and API Key to public repositories
- Consider using environment variables or a config file that's gitignored
- For production, restrict API keys and configure proper OAuth redirect URIs

## Next Steps

Once authentication is working, you can:
- Fetch emails from Gmail
- Create calendar events
- Sync tasks with Google Calendar
- Parse emails for tasks and deadlines

## Additional Resources

- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [OAuth 2.0 for Client-side Web Applications](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow)
