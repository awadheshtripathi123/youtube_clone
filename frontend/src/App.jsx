import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VideoWatch from './pages/VideoWatch';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import Channel from './pages/Channel';
import Search from './pages/Search';
import LikedVideos from './pages/LikedVideos';
import Playlists from './pages/Playlists';
import PlaylistDetail from './pages/PlaylistDetail';
import Tweets from './pages/Tweets';
import Loading from './components/Loading';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;

  return children;
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) return <Loading />;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/video/:videoId" element={<VideoWatch />} />
        <Route path="/channel/:username" element={<Channel />} />
        <Route path="/tweets" element={<Tweets />} />
        
        <Route path="/liked-videos" element={
          <ProtectedRoute>
            <LikedVideos />
          </ProtectedRoute>
        } />
        <Route path="/playlists" element={
          <ProtectedRoute>
            <Playlists />
          </ProtectedRoute>
        } />
        <Route path="/playlist/:playlistId" element={
          <ProtectedRoute>
            <PlaylistDetail />
          </ProtectedRoute>
        } />
        <Route path="/upload" element={
          <ProtectedRoute>
            <Upload />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};

const App = () => {
  return <AppContent />;
};

export default App;