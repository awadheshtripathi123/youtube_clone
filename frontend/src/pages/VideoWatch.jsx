import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { videoService, commentService, likeService, subscriptionService, playlistService } from '../services/api';
import { FiThumbsUp, FiThumbsDown, FiShare2, FiMoreHorizontal, FiUser, FiSend, FiMessageCircle, FiPlusSquare, FiX, FiCheck } from 'react-icons/fi';
import Loading from '../components/Loading';

const DUMMY_RELATED = [
  { _id: 'r1', title: 'I Spent 100 Days Building A Web Browser', views: 8900000, duration: 1800, createdAt: new Date('2023-11-01').toISOString(), thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=400&q=80', owner: { username: 'CodeGod' } },
  { _id: 'r2', title: 'Why you should stop using console.log', views: 450000, duration: 620, createdAt: new Date('2024-02-15').toISOString(), thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80', owner: { username: 'JSPro' } },
  { _id: 'r3', title: 'My Minimal Desk Setup 2024', views: 1200000, duration: 450, createdAt: new Date('2024-01-10').toISOString(), thumbnail: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&q=80', owner: { username: 'TechMinimalist' } },
  { _id: 'r4', title: 'Learning Rust in 24 Hours', views: 800000, duration: 2400, createdAt: new Date('2024-03-20').toISOString(), thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?w=400&q=80', owner: { username: 'RustGuy' } },
  { _id: 'r5', title: 'Creating a viral game in 2 hours', views: 3200000, duration: 750, createdAt: new Date('2023-12-05').toISOString(), thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80', owner: { username: 'IndieDev' } }
];

const VideoWatch = () => {
  const { videoId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Playlist Modal State
  const [showModal, setShowModal] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  
  // Interaction states
  const [likedComments, setLikedComments] = useState(new Set());
  const [dislikedComments, setDislikedComments] = useState(new Set());
  const [isDisliked, setIsDisliked] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [showVideoMenu, setShowVideoMenu] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await videoService.getVideoById(videoId);
        setVideo(response.data.data);
        setLikeCount(response.data.data.likes || 0);
        
        try {
           const commentsRes = await commentService.getVideoComments(videoId);
           setComments(commentsRes.data.data.comments || []);
        } catch(e) {}
        
        try {
            const subsRes = await subscriptionService.getChannelSubscribers(response.data.data.owner._id);
            setSubscriberCount(subsRes.data.data.subscribers.length);
            if (user) {
              setIsSubscribed(subsRes.data.data.subscribers.some(s => s.subscriber._id === user._id));
            }
        } catch (e) {}
        
        if (user) {
           try {
             const likedRes = await likeService.getLikedVideos();
             setIsLiked(likedRes.data.data.some(v => v._id === videoId));
           } catch(e) {}
        }
      } catch (err) {
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [videoId, user, navigate]);

  const handleLike = async () => {
    if (!user) return navigate('/login');
    try {
      if (isDisliked) setIsDisliked(false);
      await likeService.toggleVideoLike(videoId);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (err) {}
  };

  const handleDislike = async () => {
    if (!user) return navigate('/login');
    setIsDisliked(!isDisliked);
    if (isLiked) {
      try {
        await likeService.toggleVideoLike(videoId);
        setIsLiked(false);
        setLikeCount(prev => prev - 1);
      } catch (err) {}
    }
  };

  const handleSubscribe = async () => {
    if (!user) return navigate('/login');
    try {
      await subscriptionService.toggleSubscribe(video.owner._id);
      setIsSubscribed(!isSubscribed);
      setSubscriberCount(prev => isSubscribed ? prev - 1 : prev + 1);
    } catch (err) {}
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("Video link copied to clipboard!");
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const response = await commentService.addComment(videoId, { content: newComment });
      setComments([response.data.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const openPlaylistModal = async () => {
    if (!user) return navigate('/login');
    setShowModal(true);
    try {
      const res = await playlistService.getMyPlaylists();
      setPlaylists(res.data.data);
    } catch (err) {
      console.error("Failed to load playlists");
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      const res = await playlistService.createPlaylist({ name: newPlaylistName, description: '' });
      setPlaylists([...playlists, res.data.data]);
      setNewPlaylistName('');
      setShowCreatePlaylist(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!user) return navigate('/login');
    
    if (dislikedComments.has(commentId)) {
      setDislikedComments(prev => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }

    try {
      await likeService.toggleCommentLike(commentId);
      setLikedComments(prev => {
        const next = new Set(prev);
        if (next.has(commentId)) next.delete(commentId);
        else next.add(commentId);
        return next;
      });
    } catch (e) {}
  };

  const handleCommentDislike = async (commentId) => {
    if (!user) return navigate('/login');
    
    setDislikedComments(prev => {
      const next = new Set(prev);
      if (next.has(commentId)) next.delete(commentId);
      else next.add(commentId);
      return next;
    });

    if (likedComments.has(commentId)) {
      try {
        await likeService.toggleCommentLike(commentId);
        setLikedComments(prev => {
          const next = new Set(prev);
          next.delete(commentId);
          return next;
        });
      } catch(e) {}
    }
  };

  const handleCommentReply = (commentId) => {
    if (!user) return navigate('/login');
    setActiveReplyId(prev => prev === commentId ? null : commentId);
    setReplyContent('');
  };

  const submitReply = async (commentId) => {
    if (!replyContent.trim()) return;
    try {
      const response = await commentService.addComment(videoId, { content: replyContent, parentCommentId: commentId });
      setComments(prevComments => prevComments.map(c => {
        if (c._id === commentId) {
          return {
            ...c,
            replies: [...(c.replies || []), response.data.data]
          };
        }
        return c;
      }));
      setReplyContent('');
      setActiveReplyId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleVideoInPlaylist = async (playlistId, hasVideo) => {
    try {
      if (hasVideo) {
        await playlistService.removeVideoFromPlaylist(playlistId, videoId);
      } else {
        await playlistService.addVideoToPlaylist(playlistId, videoId);
      }
      const res = await playlistService.getMyPlaylists();
      setPlaylists(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    return views || 0;
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <Loading />;
  if (!video) return <Loading />;

  return (
    <div className="bg-[#0f0f0f] min-h-screen text-white pt-4 pb-10">
      <div className="max-w-[1500px] mx-auto px-2 lg:px-6 flex flex-col lg:flex-row gap-6">
        
        <div className="flex-1 lg:max-w-[70%] xl:max-w-[75%]">
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-sm relative">
            <video
              src={video.videoFile}
              controls
              autoPlay
              className="w-full h-full object-contain"
              poster={video.thumbnail}
            />
          </div>
          
          <div className="mt-3">
             <h1 className="text-[20px] font-bold leading-tight break-words text-[#f1f1f1]">{video.title}</h1>
             
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2.5 gap-4">
                <div className="flex items-center gap-4">
                   <Link to={`/channel/${video.owner.username}`} className="flex items-center gap-3">
                     <img
                       src={video.owner.avatar || 'https://via.placeholder.com/40'}
                       alt={video.owner.username}
                       className="w-10 h-10 rounded-full object-cover bg-[#272727]"
                     />
                     <div>
                       <p className="font-semibold text-[16px] text-[#f1f1f1] leading-tight">{video.owner.fullName || video.owner.username}</p>
                       <p className="text-[12px] text-[#aaaaaa] mt-0.5">{formatViews(subscriberCount)} subscribers</p>
                     </div>
                   </Link>
                   
                   <button
                     onClick={handleSubscribe}
                     className={`ml-2 px-4 py-[9px] rounded-full font-medium text-sm transition-colors ${
                       isSubscribed 
                         ? 'bg-[#272727] text-white hover:bg-[#3f3f3f]' 
                         : 'bg-[#f1f1f1] text-[#0f0f0f] hover:bg-[#d9d9d9]'
                     }`}
                   >
                     {isSubscribed ? 'Subscribed' : 'Subscribe'}
                   </button>
                </div>
                
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0 w-full sm:w-auto">
                   <div className="flex items-center bg-[#272727] rounded-full divide-x divide-[#3f3f3f]">
                      <button onClick={handleLike} className="flex items-center gap-2 px-4 py-[9px] hover:bg-[#3f3f3f] rounded-l-full transition-colors">
                        <FiThumbsUp className={`text-[18px] ${isLiked ? 'fill-white text-white' : ''}`} />
                        <span className="text-sm font-medium">{likeCount > 0 ? formatViews(likeCount) : 'Like'}</span>
                      </button>
                      <button onClick={handleDislike} className="flex items-center gap-2 px-4 py-[9px] hover:bg-[#3f3f3f] rounded-r-full transition-colors">
                        <FiThumbsDown className={`text-[18px] ${isDisliked ? 'fill-white text-white' : ''}`} />
                      </button>
                   </div>
                   
                   <button onClick={handleShare} className="flex items-center gap-2 px-4 py-[9px] bg-[#272727] rounded-full hover:bg-[#3f3f3f] transition-colors whitespace-nowrap">
                     <FiShare2 className="text-[18px]" />
                     <span className="text-sm font-medium">Share</span>
                   </button>
                   
                   <button onClick={() => openPlaylistModal()} className="flex items-center gap-2 px-4 py-[9px] bg-[#272727] rounded-full hover:bg-[#3f3f3f] transition-colors whitespace-nowrap">
                     <FiPlusSquare className="text-[18px]" />
                     <span className="text-sm font-medium">Save</span>
                   </button>
                   
                   <div className="relative">
                     <button onClick={() => setShowVideoMenu(!showVideoMenu)} className="flex items-center justify-center w-10 h-10 bg-[#272727] rounded-full hover:bg-[#3f3f3f] transition-colors flex-shrink-0">
                       <FiMoreHorizontal className="text-[18px]" />
                     </button>
                     {showVideoMenu && (
                       <div className="absolute right-0 mt-2 w-48 bg-[#272727] rounded-xl shadow-xl z-10 py-2 border border-[#3f3f3f]">
                          <button className="flex items-center w-full px-4 py-2 text-sm text-[#f1f1f1] hover:bg-[#3f3f3f]">Report</button>
                          <button className="flex items-center w-full px-4 py-2 text-sm text-[#f1f1f1] hover:bg-[#3f3f3f]">Show transcript</button>
                       </div>
                     )}
                   </div>
                </div>
             </div>
             
             <div className="bg-[#272727] rounded-xl p-3 mt-4 hover:bg-[#3f3f3f] transition-colors cursor-pointer text-sm">
                <p className="font-semibold text-white mb-1">
                   {formatViews(video.views)} views  {timeAgo(video.createdAt)}
                </p>
                <div className="text-[#f1f1f1] whitespace-pre-wrap leading-relaxed">
                   {video.description || 'No description available for this video.'}
                </div>
             </div>
          </div>
          
          <div className="mt-6 mb-8">
            <h3 className="text-xl font-bold mb-6">{comments.length} Comments</h3>
            
            {user ? (
              <form onSubmit={handleComment} className="flex gap-4 mb-8">
                <img
                  src={user.avatar || 'https://via.placeholder.com/40'}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-[#272727]"
                />
                <div className="flex-1 flex flex-col">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-transparent border-b border-[#303030] text-[#f1f1f1] placeholder-[#888888] pb-1 focus:outline-none focus:border-white transition-colors"
                  />
                  {newComment && (
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => setNewComment('')}
                        className="px-4 py-2 hover:bg-[#272727] rounded-full font-medium text-sm transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${submitting ? 'bg-[#272727] text-[#aaaaaa]' : 'bg-[#3ea6ff] text-black hover:bg-[#65b8ff]'}`}
                      >
                        Comment
                      </button>
                    </div>
                  )}
                </div>
              </form>
            ) : (
               <div className="mb-8 p-4 bg-[#272727] rounded-xl text-center">
                 <p className="text-[#aaaaaa] mb-3">Sign in to add a comment</p>
                 <Link to="/login" className="inline-block px-4 py-2 bg-[#f1f1f1] text-black rounded-full font-medium text-sm hover:bg-[#d9d9d9] transition-colors">Sign in</Link>
               </div>
            )}
            
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-4">
                  <img
                    src={comment.owner?.avatar || 'https://via.placeholder.com/40'}
                    alt={comment.owner?.username}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 bg-[#272727]"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                       <p className="font-semibold text-sm text-[#f1f1f1]">@{comment.owner?.username}</p>
                       <span className="text-xs text-[#aaaaaa]">{timeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-[15px] text-[#f1f1f1] leading-relaxed">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-2">
                       <button onClick={() => handleCommentLike(comment._id)} className="flex items-center gap-1 group">
                         <FiThumbsUp className={`text-[15px] group-hover:text-white transition-colors ${likedComments.has(comment._id) ? 'fill-white text-white' : 'text-[#aaaaaa]'}`} />
                       </button>
                       <button onClick={() => handleCommentDislike(comment._id)} className="flex items-center gap-1 group">
                         <FiThumbsDown className={`text-[15px] group-hover:text-white transition-colors ${dislikedComments.has(comment._id) ? 'fill-white text-white' : 'text-[#aaaaaa]'}`} />
                       </button>
                       <button onClick={() => handleCommentReply(comment._id)} className="text-[12px] font-semibold text-[#f1f1f1] hover:bg-[#272727] px-3 py-1 rounded-full transition-colors transition-colors">
                         Reply
                       </button>
                    </div>
                    {activeReplyId === comment._id && (
                      <div className="flex gap-4 mt-4 w-full">
                         <img src={user?.avatar || 'https://via.placeholder.com/40'} alt="Avatar" className="w-6 h-6 rounded-full object-cover bg-[#272727]" />
                         <div className="flex-1">
                           <input 
                             type="text" 
                             value={replyContent}
                             onChange={(e) => setReplyContent(e.target.value)}
                             placeholder="Add a reply..." 
                             className="w-full bg-transparent border-b border-[#303030] text-[14px] text-[#f1f1f1] pb-1 focus:outline-none focus:border-white transition-colors" 
                             autoFocus 
                           />
                           <div className="flex justify-end gap-2 mt-2">
                             <button onClick={() => setActiveReplyId(null)} className="px-3 py-1.5 hover:bg-[#272727] rounded-full font-medium text-[13px]">Cancel</button>
                             <button onClick={() => submitReply(comment._id)} disabled={!replyContent.trim()} className="px-3 py-1.5 bg-[#3ea6ff] text-black rounded-full font-medium text-[13px] hover:bg-[#65b8ff] disabled:opacity-50">Reply</button>
                           </div>
                         </div>
                      </div>
                    )}
                    
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 space-y-4">
                        {comment.replies.map(reply => (
                          <div key={reply._id} className="flex gap-3">
                            <img
                              src={reply.owner?.avatar || 'https://via.placeholder.com/40'}
                              alt={reply.owner?.username}
                              className="w-6 h-6 rounded-full object-cover flex-shrink-0 bg-[#272727]"
                            />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                 <p className="font-semibold text-[13px] text-[#f1f1f1]">@{reply.owner?.username}</p>
                                 <span className="text-[11px] text-[#aaaaaa]">{timeAgo(reply.createdAt)}</span>
                              </div>
                              <p className="text-[14px] text-[#f1f1f1] leading-relaxed">{reply.content}</p>
                              <div className="flex items-center gap-3 mt-1">
                                 <button onClick={() => handleCommentLike(reply._id)} className="flex items-center gap-1 group">
                                   <FiThumbsUp className={`text-[13px] group-hover:text-white transition-colors ${likedComments.has(reply._id) ? 'fill-white text-white' : 'text-[#aaaaaa]'}`} />
                                 </button>
                                 <button onClick={() => handleCommentDislike(reply._id)} className="flex items-center gap-1 group">
                                   <FiThumbsDown className={`text-[13px] group-hover:text-white transition-colors ${dislikedComments.has(reply._id) ? 'fill-white text-white' : 'text-[#aaaaaa]'}`} />
                                 </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column - Related Videos */}
        <div className="w-full lg:w-[350px] xl:w-[400px] flex-shrink-0">
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
             <button className="px-3 py-1.5 bg-white text-black text-sm font-medium rounded-lg whitespace-nowrap">All</button>
             <button className="px-3 py-1.5 bg-[#272727] hover:bg-[#3f3f3f] text-white text-sm font-medium rounded-lg whitespace-nowrap transition-colors">From {video.owner.username}</button>
             <button className="px-3 py-1.5 bg-[#272727] hover:bg-[#3f3f3f] text-white text-sm font-medium rounded-lg whitespace-nowrap transition-colors">Related</button>
          </div>
          
          <div className="flex flex-col gap-3">
             {DUMMY_RELATED.map(rel => (
               <Link to={`/video/${rel._id}`} key={rel._id} className="flex gap-2 group cursor-pointer">
                  {/* Thumbnail */}
                  <div className="w-[160px] h-[90px] flex-shrink-0 relative rounded-lg overflow-hidden bg-[#1f1f1f]">
                     <img src={rel.thumbnail} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                     <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[11px] font-semibold text-white">
                        {formatDuration(rel.duration)}
                     </div>
                  </div>
                  {/* Info */}
                  <div className="flex flex-col flex-1 pl-1">
                     <h3 className="font-medium text-[14px] leading-tight line-clamp-2 text-[#f1f1f1] group-hover:text-[#3ea6ff] mb-1">{rel.title}</h3>
                     <p className="text-[12px] text-[#aaaaaa] hover:text-white mb-0.5">{rel.owner.username}</p>
                     <p className="text-[12px] text-[#aaaaaa]">{formatViews(rel.views)} views • {timeAgo(rel.createdAt)}</p>
                  </div>
               </Link>
             ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#212121] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-[#3f3f3f]">
             <div className="flex justify-between items-center px-4 py-3 border-b border-[#3f3f3f]">
                <h3 className="text-[16px] font-semibold text-white">Save video to...</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-[#3f3f3f] rounded-full transition-colors"><FiX className="text-xl" /></button>
             </div>
             
             <div className="p-2 max-h-[300px] overflow-y-auto">
                {playlists.map(pl => {
                   const hasVideo = pl.videos?.includes(videoId) || pl.videos?.some(v => v._id === videoId);
                   return (
                     <label key={pl._id} className="flex items-center gap-4 px-3 py-2 hover:bg-[#3f3f3f] rounded-lg cursor-pointer transition-colors">
                        <div className={`w-5 h-5 flex items-center justify-center rounded-sm border ${hasVideo ? 'bg-[#3ea6ff] border-[#3ea6ff]' : 'border-[#888888]'}`}>
                           {hasVideo && <FiCheck className="text-black text-xs" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={hasVideo} onChange={() => toggleVideoInPlaylist(pl._id, hasVideo)} />
                        <span className="text-[14px] text-white truncate flex-1">{pl.name}</span>
                     </label>
                   )
                })}
                {playlists.length === 0 && <p className="text-center text-[#aaaaaa] py-4 text-sm">No playlists yet.</p>}
             </div>
             
             <div className="p-3 border-t border-[#3f3f3f]">
                {!showCreatePlaylist ? (
                  <button onClick={() => setShowCreatePlaylist(true)} className="flex items-center gap-2 px-2 py-1 text-[14px] font-medium text-[#f1f1f1] hover:text-white w-full justify-center">
                    <FiPlusSquare className="text-lg" /> Create new playlist
                  </button>
                ) : (
                  <div className="px-2 pb-2">
                    <p className="text-[12px] text-[#aaaaaa] mb-1">Name</p>
                    <input 
                       type="text" 
                       value={newPlaylistName} 
                       onChange={e => setNewPlaylistName(e.target.value)} 
                       placeholder="Enter playlist name..." 
                       className="w-full bg-transparent border-b border-[#3ea6ff] text-[#f1f1f1] focus:outline-none py-1 mb-4 text-sm"
                       autoFocus
                    />
                    <div className="flex justify-end gap-2">
                       <button onClick={() => setShowCreatePlaylist(false)} className="text-[14px] font-medium px-3 py-1.5 hover:bg-[#3f3f3f] rounded-full transition-colors">Cancel</button>
                       <button onClick={handleCreatePlaylist} disabled={!newPlaylistName.trim()} className="text-[14px] font-medium text-[#3ea6ff] px-3 py-1.5 hover:bg-[#3ea6ff]/10 rounded-full transition-colors disabled:opacity-50">Create</button>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoWatch;
