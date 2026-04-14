import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
          throw new Error("No refresh token");
        }
        const response = await axios.post(`${API_URL}/user/refresh-token`, {
          refreshToken,
        });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        Cookies.set('accessToken', accessToken, { expires: 1 });
        Cookies.set('refreshToken', newRefreshToken, { expires: 10 });
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        if (window.location.pathname !== '/' && window.location.pathname !== '/login' && window.location.pathname !== '/register' && !window.location.pathname.startsWith('/video/') && !window.location.pathname.startsWith('/channel/')) {
           window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data) => api.post('/user/register', data),
  login: (data) => api.post('/user/login', data),
  logout: () => api.post('/user/logout'),
  getCurrentUser: () => api.get('/user/current-user'),
  changePassword: (data) => api.post('/user/change-password', data),
  updateAccount: (data) => api.patch('/user/update-account', data),
  updateAvatar: (formData) => api.patch('/user/update-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateCoverImage: (formData) => api.patch('/user/update-coverImage', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getChannelProfile: (username) => api.get(`/user/channel/${username}`),
  getWatchHistory: () => api.get('/user/watch-history'),
};

export const videoService = {
  getAllVideos: (params) => api.get('/video', { params }),
  getVideoById: (id) => api.get(`/video/${id}`),
  publishVideo: (formData) => api.post('/video/publish', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateVideo: (id, data) => api.patch(`/video/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteVideo: (id) => api.delete(`/video/${id}`),
  togglePublish: (id) => api.patch(`/video/${id}/toggle-publish`),
  getUserVideos: (userId) => api.get(`/video/user/${userId}`),
};

export const subscriptionService = {
  toggleSubscribe: (channelId) => api.post(`/subscription/subscribe/${channelId}`),
  getUserSubscriptions: () => api.get('/subscription/subscriptions'),
  getChannelSubscribers: (channelId) => api.get(`/subscription/subscribers/${channelId}`),
  getSubscribedChannels: (userId) => api.get(`/subscription/channels/${userId}`),
};

export const commentService = {
  addComment: (videoId, data) => api.post(`/comments/video/${videoId}`, data),
  getVideoComments: (videoId, params) => api.get(`/comments/video/${videoId}`, { params }),
  updateComment: (commentId, data) => api.patch(`/comments/${commentId}`, data),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

export const likeService = {
  toggleVideoLike: (videoId) => api.post(`/likes/video/${videoId}`),
  toggleCommentLike: (commentId) => api.post(`/likes/comment/${commentId}`),
  toggleTweetLike: (tweetId) => api.post(`/likes/tweet/${tweetId}`),
  getLikedVideos: () => api.get('/likes/videos'),
};

export const tweetService = {
  createTweet: (data) => api.post('/tweets', data),
  getAllTweets: () => api.get('/tweets'),
  getUserTweets: (userId) => api.get(`/tweets/user/${userId}`),
  updateTweet: (tweetId, data) => api.patch(`/tweets/${tweetId}`, data),
  deleteTweet: (tweetId) => api.delete(`/tweets/${tweetId}`),
};

export const playlistService = {
  createPlaylist: (data) => api.post('/playlists', data),
  getMyPlaylists: () => api.get('/playlists'),
  getUserPlaylists: (userId) => api.get(`/playlists/user/${userId}`),
  getPlaylistById: (playlistId) => api.get(`/playlists/${playlistId}`),
  updatePlaylist: (playlistId, data) => api.patch(`/playlists/${playlistId}`, data),
  deletePlaylist: (playlistId) => api.delete(`/playlists/${playlistId}`),
  addVideoToPlaylist: (playlistId, videoId) => api.patch(`/playlists/${playlistId}/add-video`, { videoId }),
  removeVideoFromPlaylist: (playlistId, videoId) => api.patch(`/playlists/${playlistId}/remove-video`, { videoId }),
};

export default api;