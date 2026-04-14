import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authService, videoService, subscriptionService } from '../services/api';
import { FiUserPlus, FiCheck, FiPlay, FiEye } from 'react-icons/fi';
import Loading from '../components/Loading';

const Channel = () => {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const fetchChannel = async () => {
      try {
        const response = await authService.getChannelProfile(username);
        setChannel(response.data.data);
        setIsSubscribed(response.data.data.isSubscribed || false);
        
        const videosRes = await videoService.getUserVideos(response.data.data._id);
        setVideos(videosRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchChannel();
  }, [username]);

  const handleSubscribe = async () => {
    try {
      await subscriptionService.toggleSubscribe(channel._id);
      setIsSubscribed(!isSubscribed);
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
  if (!channel) return <div className="container-custom py-8">Channel not found</div>;

  return (
    <div className="min-h-screen">
      {/* Cover Image */}
      <div className="h-48 bg-dark-800">
        {channel.coverImage && (
          <img src={channel.coverImage} alt="Cover" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="container-custom">
        {/* Profile Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 -mt-12 mb-6">
          <img
            src={channel.avatar}
            alt={channel.username}
            className="w-24 h-24 rounded-full border-4 border-dark-950 object-cover"
          />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{channel.fullName}</h1>
            <p className="text-dark-400">@{channel.username}</p>
          </div>
          <button
            onClick={handleSubscribe}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-colors ${
              isSubscribed 
                ? 'bg-dark-700 text-white border border-dark-600' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isSubscribed ? <FiCheck /> : <FiUserPlus />}
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-6 mb-8 text-sm">
          <span><strong>{channel.subscribersCount || 0}</strong> subscribers</span>
          <span><strong>{channel.channelSubscribedToCount || 0}</strong> subscriptions</span>
        </div>

        {/* Videos */}
        <h2 className="text-xl font-bold mb-4">Videos ({videos.length})</h2>
        {videos.length === 0 ? (
          <p className="text-dark-400">No videos yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {videos.map((video) => (
              <Link to={`/video/${video._id}`} key={video._id} className="card group">
                <div className="relative aspect-video">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs">
                    {formatDuration(video.duration)}
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-medium line-clamp-2 group-hover:text-red-400">{video.title}</h3>
                  <p className="text-sm text-dark-400 mt-1">{video.views} views</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Channel;
