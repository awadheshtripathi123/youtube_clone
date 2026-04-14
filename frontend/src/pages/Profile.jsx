import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService, videoService } from '../services/api';
import { FiUser, FiMail, FiCamera, FiImage, FiEdit2, FiSave, FiPlay } from 'react-icons/fi';
import Loading from '../components/Loading';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '' });
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Videos');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await videoService.getUserVideos(user._id);
        setVideos(response.data.data || []);
        setFormData({ fullName: user.fullName, email: user.email });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (avatar) {
        const formDataImg = new FormData();
        formDataImg.append('avatar', avatar);
        await authService.updateAvatar(formDataImg);
      }
      if (coverImage) {
        const formDataCover = new FormData();
        formDataCover.append('coverImage', coverImage);
        await authService.updateCoverImage(formDataCover);
      }
      await authService.updateAccount(formData);
      
      const currentUserData = await authService.getCurrentUser();
      updateUser(currentUserData.data.data);
      
      setEditing(false);
      setAvatarPreview(null);
      setCoverPreview(null);
      setAvatar(null);
      setCoverImage(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const tabs = ['Home', 'Videos', 'Shorts', 'Live', 'Podcasts', 'Playlists', 'Community'];
  
  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-16">
      <div className="w-full max-w-[1284px] mx-auto pt-4 md:pt-6 px-4 sm:px-8 xl:px-0">
        
        {/* Cover Image banner */}
        <div className="w-full h-[15vw] min-h-[100px] max-h-[212px] bg-[#1f1f1f] md:rounded-2xl relative group overflow-hidden">
          {(coverPreview || user.coverImage) ? (
            <img src={coverPreview || user.coverImage} alt="Cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
               <FiImage className="text-5xl text-dark-400 opacity-20" />
            </div>
          )}
          
          {editing && (
            <label className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full cursor-pointer transition-colors z-10 group-hover:opacity-100">
              <FiCamera className="text-white text-xl m-1" />
              <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
            </label>
          )}
        </div>

        {/* Channel Header (Avatar + Info) */}
        <div className="flex flex-col sm:flex-row mt-6 md:mt-8 gap-4 md:gap-6 items-start">
          {/* Avatar */}
          <div className="relative shrink-0 mx-auto sm:mx-0">
            <img 
              src={avatarPreview || user.avatar || 'https://via.placeholder.com/160'} 
              alt={user.username}
              className="w-32 h-32 md:w-[160px] md:h-[160px] rounded-full object-cover bg-[#1f1f1f]" 
            />
            {editing && (
              <label className="absolute bottom-1 right-1 p-2 bg-[#272727] hover:bg-[#3f3f3f] border border-[#0f0f0f] rounded-full cursor-pointer transition-colors shadow-lg">
                <FiCamera className="text-white m-1" />
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Info Side */}
          <div className="flex-1 flex flex-col justify-center py-2 w-full text-center sm:text-left">
            {editing ? (
              <input 
                type="text" 
                value={formData.fullName} 
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-[#272727] border-b border-[#aaaaaa] text-3xl md:text-4xl font-bold text-white px-2 py-1 mb-2 focus:outline-none w-full max-w-md mx-auto sm:mx-0"
                placeholder="Channel Name"
              />
            ) : (
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{user.fullName}</h1>
            )}
            
            <div className="flex flex-wrap items-center justify-center sm:justify-start text-[#aaaaaa] text-sm gap-2">
              <span className="font-medium text-white">@{user.username}</span>
              <span className="w-1 h-1 bg-[#aaaaaa] rounded-full"></span>
              <span>0 subscribers</span>
              <span className="w-1 h-1 bg-[#aaaaaa] rounded-full"></span>
              <span>{videos.length} videos</span>
            </div>
            
            <div className="text-[#aaaaaa] mt-3 text-sm flex items-center justify-center sm:justify-start">
              {editing ? (
                <div className="flex items-center w-full max-w-md">
                   <FiMail className="mr-2" />
                   <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-[#272727] border-b border-[#aaaaaa] text-sm text-white px-2 py-1 focus:outline-none w-full"
                    placeholder="Email Address"
                  />
                </div>
              ) : (
                <span className="line-clamp-1 max-w-[600px] cursor-pointer hover:text-white">
                   Contact: {user.email} • Joined {new Date(user.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                   <span className="font-bold ml-2">...more</span>
                </span>
              )}
            </div>

            <div className="flex justify-center sm:justify-start gap-2 mt-4 w-full">
               {editing ? (
                 <>
                   <button onClick={() => setEditing(false)} className="bg-transparent hover:bg-[#272727] text-white font-medium py-2 px-4 rounded-full transition-colors text-sm">Cancel</button>
                   <button onClick={handleSave} disabled={saving} className="bg-[#3ea6ff] hover:bg-[#65b8ff] text-black font-semibold py-2 px-4 rounded-full transition-colors text-sm">
                     {saving ? 'Saving...' : 'Save changes'}
                   </button>
                 </>
               ) : (
                 <>
                   <button onClick={() => setEditing(true)} className="bg-[#272727] hover:bg-[#3f3f3f] text-white font-medium py-[8px] px-[16px] rounded-full transition-colors text-sm">Customize channel</button>
                   <button className="bg-[#272727] hover:bg-[#3f3f3f] text-white font-medium py-[8px] px-[16px] rounded-full transition-colors text-sm">Manage videos</button>
                 </>
               )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 border-b border-[#272727] flex overflow-x-auto no-scrollbar w-full text-[15px] font-medium text-[#aaaaaa]">
           {tabs.map((tab) => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-6 py-3 border-b-2 flex-shrink-0 transition-colors uppercase ${activeTab === tab ? 'border-[#f1f1f1] text-[#f1f1f1]' : 'border-transparent hover:text-[#f1f1f1]'}`}
             >
               {tab}
             </button>
           ))}
        </div>

        {/* Tab Content Area */}
        <div className="mt-6 w-full min-h-[400px]">
           {activeTab === 'Videos' && (
             videos.length === 0 ? (
               <div className="py-20 flex flex-col items-center text-center">
                  <p className="text-white text-lg">Create content on any device</p>
                  <p className="text-[#aaaaaa] mt-2 mb-6">Upload and record at home or on the go.</p>
                  <button onClick={() => navigate('/upload')} className="bg-[#f1f1f1] text-black px-4 py-2 rounded-full font-medium text-sm hover:bg-[#d9d9d9] transition-colors">Create</button>
               </div>
             ) : (
               <>
                 <div className="flex items-center gap-2 mb-4">
                    <button className="px-3 py-[6px] bg-white text-black font-medium text-sm rounded-lg">Latest</button>
                    <button className="px-3 py-[6px] bg-[#272727] hover:bg-[#3f3f3f] text-white font-medium text-sm rounded-lg transition-colors">Popular</button>
                    <button className="px-3 py-[6px] bg-[#272727] hover:bg-[#3f3f3f] text-white font-medium text-sm rounded-lg transition-colors">Oldest</button>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-y-10 gap-x-4">
                    {videos.map((video) => (
                      <Link to={`/video/${video._id}`} key={video._id} className="group cursor-pointer block">
                        <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-[#1f1f1f]">
                          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute bottom-1 right-1 bg-black/80 px-[4px] py-[1px] rounded text-xs font-semibold text-white">
                            {formatDuration(video.duration)}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-[15px] line-clamp-2 leading-snug mb-[4px] text-white group-hover:text-[#3ea6ff] transition-colors">{video.title}</h3>
                          <div className="text-[13px] text-[#aaaaaa] flex flex-col group-hover:text-white transition-colors">
                            <span className="flex items-center gap-1">
                              {video.views} views
                              <span className="text-[10px]">•</span> 
                              {new Date(video.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                 </div>
               </>
             )
           )}

           {activeTab === 'Home' && (
             <div className="py-20 flex flex-col items-center justify-center text-center">
               <p className="text-[#f1f1f1] text-lg font-medium">Welcome to {user.fullName}'s channel</p>
               <p className="text-[#aaaaaa] mt-2">Customize your channel homepage by adding sections.</p>
             </div>
           )}

           {activeTab !== 'Videos' && activeTab !== 'Home' && (
             <div className="py-24 flex flex-col items-center justify-center text-center">
               <p className="text-[#f1f1f1] text-lg font-medium mb-2">This channel doesn't have any {activeTab.toLowerCase()} yet</p>
               {activeTab === 'Playlists' && (
                 <button onClick={() => navigate('/playlists')} className="mt-4 px-4 py-2 bg-[#272727] hover:bg-[#3f3f3f] text-white rounded-full transition-colors text-sm font-medium">
                   View my playlists
                 </button>
               )}
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
