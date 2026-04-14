import { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiMenu, FiVideo, FiBell, FiUser, FiLogOut, FiPlay, FiHeart, FiList, FiMic, FiHome, FiCompass, FiClock, FiSettings, FiHelpCircle, FiMessageSquare } from 'react-icons/fi';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SIDEBAR_ITEMS = [
    { icon: <FiHome />, label: 'Home', path: '/' },
    { icon: <FiCompass />, label: 'Explore', path: '/search?q=explore' },
    { icon: <FiPlay />, label: 'Subscriptions', path: '/tweets' },
    { divider: true },
    { icon: <FiList />, label: 'Library', path: '/playlists' },
    { icon: <FiClock />, label: 'History', path: '/' },
    { icon: <FiVideo />, label: 'Your videos', path: '/profile' },
    { icon: <FiHeart />, label: 'Liked videos', path: '/liked-videos' },
    { divider: true },
    { icon: <FiSettings />, label: 'Settings', path: '/profile' }
  ];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-[60] bg-[#0f0f0f]/95 backdrop-blur-sm h-[56px] px-4 flex items-center justify-between">
        {/* Left: Menu & Logo */}
        <div className="flex items-center gap-4 w-[200px]">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[#272727] rounded-full hidden sm:block transition-colors">
            <FiMenu className="text-xl" />
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-[#272727] rounded-full sm:hidden transition-colors">
            <FiMenu className="text-xl" />
          </button>
          <Link to="/" className="flex items-center gap-1 group" title="YouTube Home">
            <div className="flex items-center justify-center w-8 h-6 bg-[#ff0000] rounded-lg">
              <FiPlay className="text-white fill-white w-3 h-3" />
            </div>
            <span className="text-xl font-semibold tracking-tighter" style={{fontFamily: 'Oswald, sans-serif'}}>YouTube</span>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="flex-1 flex justify-center max-w-[720px] px-1 sm:px-4">
          <form onSubmit={handleSearch} className="flex w-full group">
            <div className="flex w-full rounded-l-full border border-[#303030] bg-[#121212] overflow-hidden ml-4 sm:ml-12 group-focus-within:border-[#1c62b9] group-focus-within:ml-0 group-focus-within:pl-4 sm:group-focus-within:ml-8 transition-all">
               <FiSearch className="hidden sm:group-focus-within:block text-white self-center mr-2 ml-1" />
               <input
                 type="text"
                 placeholder="Search"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full bg-transparent px-4 py-2 text-white placeholder-[#888888] focus:outline-none"
               />
            </div>
            <button type="submit" className="px-5 bg-[#222222] border border-l-0 border-[#303030] rounded-r-full hover:bg-[#303030] transition-colors" title="Search">
              <FiSearch className="text-xl text-white" />
            </button>
            <button type="button" onClick={() => alert('Voice search activated')} className="hidden sm:flex ml-4 p-2.5 bg-[#181818] hover:bg-[#303030] rounded-full transition-colors flex-shrink-0" title="Search with your voice">
              <FiMic className="text-xl" />
            </button>
          </form>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2 justify-end min-w-[120px]">
          {user ? (
            <>
              <Link to="/upload" className="hidden sm:block p-2.5 hover:bg-[#272727] rounded-full transition-colors" title="Create">
                <FiVideo className="text-xl" />
              </Link>
              <Link to="/tweets" className="hidden sm:block p-2.5 hover:bg-[#272727] rounded-full transition-colors" title="Notifications">
                <FiBell className="text-xl" />
              </Link>
              
              {/* User Menu */}
              <div className="relative ml-1 sm:ml-2">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-1"
                >
                  <img
                    src={user.avatar || 'https://via.placeholder.com/32'}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#282828] rounded-xl shadow-2xl py-2 overflow-hidden z-[100] border border-[#3f3f3f]">
                    <div className="px-4 py-3 flex gap-3 border-b border-[#3f3f3f]">
                      <img src={user.avatar || 'https://via.placeholder.com/40'} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                      <div className="overflow-hidden">
                        <p className="font-medium text-[15px] text-[#f1f1f1] truncate">{user.fullName}</p>
                        <p className="text-[15px] text-[#f1f1f1] truncate">@{user.username}</p>
                        <Link to="/profile" onClick={() => setShowUserMenu(false)} className="mt-2 text-[#3ea6ff] text-sm cursor-pointer hover:underline inline-block">View your channel</Link>
                      </div>
                    </div>
                    <div className="py-2">
                      <Link to="/profile" className="flex items-center gap-4 px-4 py-2 hover:bg-[#3f3f3f]" onClick={() => setShowUserMenu(false)}>
                        <FiUser className="text-xl text-[#aaaaaa]" /> <span className="text-[15px]">Your channel</span>
                      </Link>
                      <Link to="/liked-videos" className="flex items-center gap-4 px-4 py-2 hover:bg-[#3f3f3f]" onClick={() => setShowUserMenu(false)}>
                        <FiHeart className="text-xl text-[#aaaaaa]" /> <span className="text-[15px]">Liked Videos</span>
                      </Link>
                      <Link to="/playlists" className="flex items-center gap-4 px-4 py-2 hover:bg-[#3f3f3f]" onClick={() => setShowUserMenu(false)}>
                        <FiList className="text-xl text-[#aaaaaa]" /> <span className="text-[15px]">Playlists</span>
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-2 hover:bg-[#3f3f3f] text-left">
                        <FiLogOut className="text-xl text-[#aaaaaa]" /> <span className="text-[15px]">Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="flex items-center gap-2 px-3 py-1.5 border border-[#303030] rounded-full text-[#3ea6ff] hover:bg-[#263850] transition-colors font-medium">
              <FiUser className="text-lg" /> Sign in
            </Link>
          )}
        </div>
      </header>

      <div className="flex h-screen pt-[56px] relative">
        {/* Floating Sidebar Overlay */}
        {isSidebarOpen && (
           <div className="fixed inset-0 bg-black/50 z-[50]" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        {/* Floating Sidebar */}
        <aside className={`fixed inset-y-0 left-0 bg-[#0f0f0f] z-[55] transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-all duration-300 ease-in-out w-[240px] pt-[56px] overflow-y-auto no-scrollbar flex-shrink-0 flex flex-col`}>
           <div className="px-3 pt-4">
             {SIDEBAR_ITEMS.map((item, index) => {
               if (item.divider) return <div key={`div-${index}`} className="my-3 border-b border-[#272727]"></div>;
               
               return (
                 <Link 
                   key={item.label}
                   to={item.path}
                   className={`flex items-center px-3 rounded-lg transition-colors cursor-pointer text-[#f1f1f1] ${location.pathname === item.path ? 'bg-[#272727] font-medium' : 'hover:bg-[#272727]'} h-10 gap-5`}
                 >
                   <span className={`text-xl flex-shrink-0 ${location.pathname === item.path ? 'fill-white' : ''}`}>
                      {item.icon}
                   </span>
                   <span className="text-[14px] truncate">
                      {item.label}
                   </span>
                 </Link>
               );
             })}
           </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0f0f0f] relative w-full h-[calc(100vh-56px)]">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default Layout;
