import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { likeService } from '../services/api';
import { FiHeart, FiClock, FiEye } from 'react-icons/fi';
import Loading from '../components/Loading';

const LikedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        const response = await likeService.getLikedVideos();
        setVideos(response.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLikedVideos();
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <Loading />;

  return (
    <div className="container-custom py-6">
      <div className="flex items-center gap-3 mb-6">
        <FiHeart className="text-red-500 text-2xl" />
        <h1 className="text-2xl font-bold">Liked Videos</h1>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-12">
          <FiHeart className="text-5xl mx-auto text-dark-600" />
          <p className="mt-4 text-dark-400">No liked videos yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <Link to={`/video/${video._id}`} key={video._id} className="card group">
              <div className="relative aspect-video">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs">
                  {formatDuration(video.duration)}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold line-clamp-2 group-hover:text-red-400">{video.title}</h3>
                <p className="text-sm text-dark-400 mt-1">{video.views} views</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedVideos;
