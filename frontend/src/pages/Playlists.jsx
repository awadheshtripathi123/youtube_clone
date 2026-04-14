import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { playlistService } from '../services/api';
import { FiList, FiPlus, FiPlay, FiTrash2 } from 'react-icons/fi';
import Loading from '../components/Loading';

const Playlists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '', isPublic: true });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    try {
      const response = await playlistService.getMyPlaylists();
      setPlaylists(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newPlaylist.name.trim()) return;
    setCreating(true);
    try {
      await playlistService.createPlaylist(newPlaylist);
      setShowCreate(false);
      setNewPlaylist({ name: '', description: '', isPublic: true });
      fetchPlaylists();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (playlistId) => {
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await playlistService.deletePlaylist(playlistId);
      setPlaylists(playlists.filter(p => p._id !== playlistId));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 min-h-screen text-white bg-[#0f0f0f]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <FiList className="text-[#3ea6ff] text-2xl" />
          <h1 className="text-2xl font-bold tracking-tight">Playlists</h1>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)} 
          className="flex items-center gap-2 bg-[#272727] hover:bg-[#3f3f3f] text-[#f1f1f1] font-medium py-[9px] px-4 rounded-full transition-colors"
        >
          <FiPlus className="text-lg" /> Create Playlist
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-[#1f1f1f] border border-[#3f3f3f] rounded-2xl p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={newPlaylist.name}
              onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
              placeholder="Playlist name (required)"
              className="flex-1 bg-transparent border-b border-[#3ea6ff] px-2 py-2 text-[#f1f1f1] placeholder-[#888888] focus:outline-none transition-colors"
              required
            />
            <input
              type="text"
              value={newPlaylist.description}
              onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
              placeholder="Description (optional)"
              className="flex-1 bg-transparent border-b border-[#3a3a3a] focus:border-white px-2 py-2 text-[#f1f1f1] placeholder-[#888888] focus:outline-none transition-colors"
            />
            <div className="flex items-center gap-6 justify-end mt-2 md:mt-0">
              <label className="flex items-center gap-2 cursor-pointer text-[14px] text-[#aaaaaa] hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={newPlaylist.isPublic}
                  onChange={(e) => setNewPlaylist({ ...newPlaylist, isPublic: e.target.checked })}
                  className="w-4 h-4 accent-[#3ea6ff] cursor-pointer bg-[#272727] border-[#3f3f3f]"
                />
                Public
              </label>
              <button 
                type="submit" 
                disabled={creating || !newPlaylist.name.trim()} 
                className="px-5 py-2 bg-[#f1f1f1] text-[#0f0f0f] font-medium rounded-full hover:bg-[#d9d9d9] disabled:opacity-50 transition-colors"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      )}

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FiList className="text-6xl text-[#3f3f3f] mb-4" />
          <h2 className="text-xl font-bold text-[#f1f1f1] mb-2">No playlists found</h2>
          <p className="text-[#aaaaaa] mb-6">Save your favorite videos so you can easily find them later.</p>
          <button 
            onClick={() => setShowCreate(true)} 
            className="px-4 py-2 bg-[#3ea6ff] text-black font-medium rounded-full hover:bg-[#65b8ff] transition-colors"
          >
            Create Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-8 gap-x-4">
          {playlists.map((playlist) => (
            <div key={playlist._id} className="group relative flex flex-col cursor-pointer">
              {/* Thumbnail Container */}
              <Link to={`/playlist/${playlist._id}`} className="block relative aspect-video bg-[#1f1f1f] rounded-xl overflow-hidden mb-2">
                {playlist.videos && playlist.videos.length > 0 && playlist.videos[0].thumbnail ? (
                  <img src={playlist.videos[0].thumbnail} alt={playlist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#aaaaaa]">
                     <FiPlay className="text-5xl opacity-30" />
                  </div>
                )}
                
                {/* Overlay details that appear on hover */}
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <FiPlay className="text-4xl text-white mb-2" />
                  <span className="font-medium text-sm text-white uppercase tracking-widest">Play all</span>
                </div>
                
                {/* Count Overlay */}
                <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[12px] font-semibold text-white flex items-center gap-1">
                  <FiList className="text-[10px]" />
                  {playlist.videos?.length || 0}
                </div>
              </Link>
              
              {/* Info Container */}
              <div className="flex justify-between items-start pt-1 px-1">
                <Link to={`/playlist/${playlist._id}`} className="pr-4 flex-1">
                  <h3 className="font-semibold text-[16px] text-[#f1f1f1] leading-tight line-clamp-2 mb-1 group-hover:text-[#3ea6ff] transition-colors">
                    {playlist.name}
                  </h3>
                  <div className="text-[14px] text-[#aaaaaa] flex items-center gap-1">
                     <span className="font-medium">Playlist</span> • {playlist.isPublic ? 'Public' : 'Private'}
                  </div>
                  {playlist.description && (
                    <p className="text-[12px] text-[#aaaaaa] mt-1 line-clamp-1">{playlist.description}</p>
                  )}
                </Link>
                
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(playlist._id);
                  }}
                  className="p-2 -mr-2 hover:bg-[#3f3f3f] rounded-full text-[#aaaaaa] hover:text-[#ff4e45] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete playlist"
                >
                  <FiTrash2 className="text-lg" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlists;
