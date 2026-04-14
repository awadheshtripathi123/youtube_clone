import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tweetService, likeService } from '../services/api';
import { FiMessageCircle, FiHeart, FiUser, FiSend } from 'react-icons/fi';
import Loading from '../components/Loading';

const Tweets = () => {
  const { user } = useAuth();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTweet, setNewTweet] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchTweets();
  }, []);

  const fetchTweets = async () => {
    try {
      const response = await tweetService.getAllTweets();
      setTweets(response.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTweet = async (e) => {
    e.preventDefault();
    if (!newTweet.trim()) return;
    setPosting(true);
    try {
      const response = await tweetService.createTweet({ content: newTweet });
      setTweets([response.data.data, ...tweets]);
      setNewTweet('');
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (tweetId) => {
    if (!user) return;
    try {
      await likeService.toggleTweetLike(tweetId);
      setTweets(tweets.map(t => 
        t._id === tweetId ? { ...t, likes: (t.likes || 0) + 1 } : t
      ));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container-custom py-6">
      <h1 className="text-2xl font-bold mb-6">Tweets</h1>

      {/* Create Tweet */}
      {user && (
        <form onSubmit={handleTweet} className="mb-6 bg-dark-900 border border-dark-800 rounded-xl p-4">
          <div className="flex gap-4">
            <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1">
              <textarea
                value={newTweet}
                onChange={(e) => setNewTweet(e.target.value)}
                placeholder="What's happening?"
                className="w-full bg-transparent text-lg resize-none focus:outline-none"
                rows={2}
                maxLength={280}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-dark-500">{280 - newTweet.length} characters left</span>
                <button type="submit" disabled={posting || !newTweet.trim()} className="btn-primary">
                  <FiSend className="inline mr-2" />
                  {posting ? 'Posting...' : 'Tweet'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tweets List */}
      {tweets.length === 0 ? (
        <div className="text-center py-12">
          <FiMessageCircle className="text-5xl mx-auto text-dark-600" />
          <p className="mt-4 text-dark-400">No tweets yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tweets.map((tweet) => (
            <div key={tweet._id} className="bg-dark-900 border border-dark-800 rounded-xl p-4">
              <div className="flex gap-4">
                <img src={tweet.owner?.avatar || 'https://via.placeholder.com/40'} alt={tweet.owner?.username} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link to={`/channel/${tweet.owner?.username}`} className="font-medium">
                      {tweet.owner?.fullName || tweet.owner?.username}
                    </Link>
                    <span className="text-dark-500">@{tweet.owner?.username}</span>
                    <span className="text-dark-500">• {new Date(tweet.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="mt-2">{tweet.content}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <button 
                      onClick={() => handleLike(tweet._id)}
                      className="flex items-center gap-2 text-dark-400 hover:text-red-400"
                    >
                      <FiHeart /> {tweet.likes || 0}
                    </button>
                    <Link 
                      to={`/tweets`}
                      className="flex items-center gap-2 text-dark-400 hover:text-white"
                    >
                      <FiMessageCircle /> Reply
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tweets;
