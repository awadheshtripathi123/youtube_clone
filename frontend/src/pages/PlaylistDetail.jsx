import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { playlistService } from '../services/api';
import { FiPlay, FiTrash2, FiArrowLeft, FiPlus } from 'react-icons/fi';
import Loading from '../components/Loading';

const PlaylistDetail = () => {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylist();
  }, [playlistId]);

  const fetchPlaylist = async () => {
    try {
      const response = await playlistService.getPlaylistById(playlistId);
      setPlaylist(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveVideo = async (videoId) => {
    try {
      await playlistService.removeVideoFromPlaylist(playlistId, videoId);
      setPlaylist({
        ...playlist,
        videos: playlist.videos.filter(v => (v._id || v) !== videoId)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <Loading />;
  if (!playlist) return <div className="container-custom py-8">Playlist not found</div>;

  return (
    <div className="container-custom py-6">
      <Link to="/playlists" className="flex items-center gap-2 text-dark-400 hover:text-white mb-4">
        <FiArrowLeft /> Back to Playlists
      </Link>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-64 aspect-video bg-dark-800 rounded-xl flex items-center justify-center">
          {playlist.videos?.length > 0 ? (
            <img src={playlist.videos[0].thumbnail} alt={playlist.name} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <FiPlay className="text-5xl text-dark-600" />
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{playlist.name}</h1>
          <p className="text-dark-400 mt-1">{playlist.description || 'No description'}</p>
          <p className="text-sm text-dark-500 mt-2">{playlist.videos?.length || 0} videos</p>
        </div>
      </div>

      {playlist.videos?.length === 0 ? (
        <div className="text-center py-12">
          <FiPlay className="text-5xl mx-auto text-dark-600" />
          <p className="mt-4 text-dark-400">No videos in this playlist.</p>
          <Link to="/" className="btn-primary inline-block mt-4">Browse Videos</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {playlist.videos.map((video, index) => (
            <div key={video._id || index} className="flex items-center gap-4 p-3 bg-dark-900 rounded-xl hover:bg-dark-800">
              <span className="text-dark-500 w-6">{index + 1}</span>
              <Link to={`/video/${video._id}`} className="flex items-center gap-4 flex-1">
                <img src={video.thumbnail} alt={video.title} className="w-40 aspect-video object-cover rounded-lg" />
                <div>
                  <h3 className="font-medium">{video.title}</h3>
                  <p className="text-sm text-dark-400">{video.views} views</p>
                </div>
              </Link>
              <span className="text-dark-400">{formatDuration(video.duration)}</span>
              <button onClick={() => handleRemoveVideo(video._id)} className="p-2 hover:bg-dark-700 rounded-lg text-red-400">
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistDetail;
