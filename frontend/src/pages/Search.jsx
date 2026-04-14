import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { videoService } from '../services/api';
import { FiSearch, FiClock, FiEye } from 'react-icons/fi';
import Loading from '../components/Loading';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(query);

  useEffect(() => {
    if (query) {
      searchVideos(query);
    }
  }, [query]);

  const searchVideos = async (q) => {
    setLoading(true);
    try {
      const response = await videoService.getAllVideos({ query: q });
      setVideos(response.data.data.docs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchVideos(searchQuery);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container-custom py-6">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos..."
              className="input-field pl-12"
            />
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
          </div>
          <button type="submit" className="btn-primary px-6">Search</button>
        </div>
      </form>

      {loading ? (
        <Loading />
      ) : query && videos.length === 0 ? (
        <div className="text-center py-12">
          <FiSearch className="text-5xl mx-auto text-dark-600" />
          <p className="mt-4 text-dark-400">No videos found for "{query}"</p>
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
                <div className="flex items-center gap-2 mt-2 text-sm text-dark-400">
                  <FiEye className="text-sm" />
                  <span>{video.views} views</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
