import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { videoService } from '../services/api';
import Loading from '../components/Loading';

const DUMMY_VIDEOS = [
  {
    _id: 'dummy1',
    title: 'Building a Full Stack YouTube Clone with React & Node.js',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    duration: 1530,
    views: 1250000,
    createdAt: new Date('2024-03-10').toISOString(),
    owner: {
       username: 'TechMaster',
       avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80'
    }
  },
  {
    _id: 'dummy2',
    title: 'Top 10 Programming Languages to Learn in 2024',
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80',
    duration: 645,
    views: 84000,
    createdAt: new Date('2024-04-05').toISOString(),
    owner: {
       username: 'CodeDaily',
       avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&q=80'
    }
  },
  {
    _id: 'dummy3',
    title: 'Lofi Hip Hop Radio - Beats to Relax/Study to',
    thumbnail: 'https://images.unsplash.com/photo-1516280440502-869542a66c4c?w=800&q=80',
    duration: 36000,
    views: 45000000,
    createdAt: new Date('2023-01-15').toISOString(),
    owner: {
       username: 'ChilledCow',
       avatar: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&q=80'
    }
  },
  {
    _id: 'dummy4',
    title: 'SpaceX Starship Launch View from California!',
    thumbnail: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=800&q=80',
    duration: 124,
    views: 320000,
    createdAt: new Date('2024-04-10').toISOString(),
    owner: {
       username: 'SpaceNerd',
       avatar: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=100&q=80'
    }
  },
  {
    _id: 'dummy5',
    title: 'Day in the Life of a Software Engineer in Tokyo',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
    duration: 980,
    views: 120500,
    createdAt: new Date('2024-02-28').toISOString(),
    owner: {
       username: 'TokyoDev',
       avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80'
    }
  },
  {
    _id: 'dummy6',
    title: 'M1 MacBook Pro Review - 1 Year Later',
    thumbnail: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    duration: 865,
    views: 245000,
    createdAt: new Date('2023-11-12').toISOString(),
    owner: {
       username: 'TechReviews',
       avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80'
    }
  },
  {
    _id: 'dummy7',
    title: 'How to make authentic Italian Pizza at Home',
    thumbnail: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&q=80',
    duration: 620,
    views: 890000,
    createdAt: new Date('2023-08-05').toISOString(),
    owner: {
       username: 'ChefMario',
       avatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&q=80'
    }
  },
  {
    _id: 'dummy8',
    title: 'Fixing my posture changed my life completely',
    thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    duration: 430,
    views: 1540000,
    createdAt: new Date('2024-01-20').toISOString(),
    owner: {
       username: 'HealthHub',
       avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'
    }
  }
];

const CHIPS = ['All', 'Gaming', 'Music', 'Live', 'Computer programming', 'Podcasts', 'News', 'Recent', 'Watched', 'New to you'];

const VideoCard = ({ video }) => {
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
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

  return (
    <Link to={`/video/${video._id}`} className="group cursor-pointer flex flex-col gap-3">
      {/* Thumbnail Container */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-[#1f1f1f]">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-1 right-1 bg-black/80 px-[4px] py-[1px] rounded text-xs font-semibold text-white">
          {formatDuration(video.duration)}
        </div>
      </div>
      
      {/* Video Info */}
      <div className="flex gap-3 pr-2">
        {video.owner && (
          <div className="flex-shrink-0">
            <Link to={`/channel/${video.owner.username}`} onClick={(e) => e.stopPropagation()}>
              <img
                src={video.owner.avatar}
                alt={video.owner.username}
                className="w-9 h-9 rounded-full object-cover bg-[#1f1f1f]"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/36'; }}
              />
            </Link>
          </div>
        )}
        <div className="flex flex-col overflow-hidden">
          <h3 className="font-semibold text-[16px] text-[#f1f1f1] line-clamp-2 leading-tight mb-1 group-hover:text-[#3ea6ff] transition-colors">
            {video.title}
          </h3>
          <div className="text-[14px] text-[#aaaaaa] flex flex-col hover:text-white transition-colors">
            {video.owner && <span className="hover:text-white">{video.owner.username}</span>}
            <div className="flex items-center">
              <span>{formatViews(video.views)} views</span>
              <span className="mx-1 text-[10px]">•</span>
              <span>{timeAgo(video.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [originalVideos, setOriginalVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChip, setActiveChip] = useState('All');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await videoService.getAllVideos({ page: 1, limit: 20 });
        const apiVideos = response.data.data?.docs || [];
        const combined = [...apiVideos, ...DUMMY_VIDEOS];
        setVideos(combined);
        setOriginalVideos(combined);
      } catch (err) {
        console.error("API error, falling back to dummy data", err);
        setVideos(DUMMY_VIDEOS);
        setOriginalVideos(DUMMY_VIDEOS);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handleChipClick = (chip) => {
    setActiveChip(chip);
    if (chip === 'All') {
      setVideos(originalVideos);
    } else {
      // Simulate fake filtering by shuffling the video array
      const shuffled = [...originalVideos].sort(() => 0.5 - Math.random());
      setVideos(shuffled);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-[#0f0f0f] pb-8 w-full">
      {/* Category Chips Bar */}
      <div className="sticky top-0 z-30 bg-[#0f0f0f]/95 backdrop-blur w-full py-3 px-4 md:px-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth">
          {CHIPS.map((chip) => (
            <button 
              key={chip} 
              onClick={() => handleChipClick(chip)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${activeChip === chip ? 'bg-white text-black' : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'}`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Grid */}
      <div className="px-4 md:px-6 pt-6 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-y-10 gap-x-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;