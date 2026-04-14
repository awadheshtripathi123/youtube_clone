import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoService } from '../services/api';
import { FiUpload, FiVideo, FiImage, FiX } from 'react-icons/fi';
import Loading from '../components/Loading';

const Upload = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }
    if (!videoFile) {
      setError('Please select a video file');
      return;
    }
    if (!thumbnail) {
      setError('Please select a thumbnail');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('videoFile', videoFile);
      formData.append('thumbnail', thumbnail);

      await videoService.publishVideo(formData);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const removeVideo = () => {
    setVideoFile(null);
    setVideoPreview(null);
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
  };

  if (uploading) return <Loading message="Uploading your video... Please do not close this page. This might take several minutes depending on the video size and your network speed." />;

  return (
    <div className="container-custom py-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Upload Video</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video File */}
          <div>
            <label className="block text-sm font-medium mb-2">Video File *</label>
            {videoPreview ? (
              <div className="relative aspect-video bg-dark-800 rounded-xl overflow-hidden">
                <video src={videoPreview} className="w-full h-full object-contain" />
                <button
                  type="button"
                  onClick={removeVideo}
                  className="absolute top-4 right-4 p-2 bg-dark-900 rounded-full hover:bg-dark-700"
                >
                  <FiX />
                </button>
              </div>
            ) : (
              <label className="block">
                <div className="border-2 border-dashed border-dark-700 rounded-xl p-12 text-center cursor-pointer hover:border-red-500 transition-colors">
                  <FiVideo className="text-4xl mx-auto text-dark-500" />
                  <p className="mt-4 text-dark-400">Click to upload video</p>
                  <p className="text-sm text-dark-500">MP4, WebM up to 500MB</p>
                </div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium mb-2">Thumbnail *</label>
            {thumbnailPreview ? (
              <div className="relative aspect-video bg-dark-800 rounded-xl overflow-hidden w-64">
                <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={removeThumbnail}
                  className="absolute top-2 right-2 p-1 bg-dark-900 rounded-full hover:bg-dark-700"
                >
                  <FiX className="text-sm" />
                </button>
              </div>
            ) : (
              <label className="block">
                <div className="border-2 border-dashed border-dark-700 rounded-xl p-8 text-center cursor-pointer hover:border-red-500 transition-colors w-64">
                  <FiImage className="text-3xl mx-auto text-dark-500" />
                  <p className="mt-2 text-dark-400">Upload thumbnail</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="Enter video title"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-[120px]"
              placeholder="Enter video description"
            />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full btn-primary py-3 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Publish Video'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
