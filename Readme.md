# YouTube Clone

Hey there! This is a full-stack YouTube clone I built using the MERN stack (MongoDB, Express, React, Node.js). I tried to implement the core features you'd expect from a video platform, from uploading large video files to commenting and managing playlists.

## Features I Built
- **Video Uploads:** Users can upload, edit, and delete videos. I hooked this up with Cloudinary and configured chunked uploads, so it safely supports processing larger files (up to 500MB) without dropping the connection.
- **Authentication:** Standard JWT-based auth setup. Passwords are safe with bcrypt, and sessions run through secure cookies.
- **Social Stuff:** You can like or dislike videos, leave comments on videos, and subscribe to other channels. 
- **Playlists:** You can create your own custom video playlists to organize your favorite content.
- **Community Tab:** Added a simplified "tweets" feature so channel owners can post text updates to their subscribers.
- **Profile Dashboard:** A user dashboard track record that shows upload history, total user views, and channel statistics.

## Tech Stack
- **Frontend:** React.js (Vite), React Router, Context API for state, and Axios for fetching.
- **Backend:** Node.js, Express, MongoDB (Mongoose).
- **File Handling:** Multer handles the temp files locally, and Cloudinary hosts the actual media.

## Folder Structure
I split the project into two main folders to keep things decoupled:
- `/backend`: The whole Express/Node server, models, and routes. 
- `/frontend`: The React codebase.

## How to run it locally

1. Set up your environment variables. In the `backend` folder, create a `.env` file and add your own credentials:
```env
PORT=8000
MONGODB_URI=your_mongodb_cluster_url
CORS_ORIGIN=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

ACCESS_TOKEN_SECRET=some_random_secret_string
REFRESH_TOKEN_SECRET=another_random_secret_string
```

2. Open a terminal, head into the backend, install the packages, and start the development server:
```bash
cd backend
npm install
npm run dev
```

3. Open a separate terminal, head into the frontend, install the client packages, and start Vite:
```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173` and communicate with the backend on port `8000`.
