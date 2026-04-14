import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiImage } from 'react-icons/fi';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    avatar: null,
    coverImage: null,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, avatar: file });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, coverImage: file });
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('password', formData.password);
      if (formData.avatar) data.append('avatar', formData.avatar);
      if (formData.coverImage) data.append('coverImage', formData.coverImage);

      await register(data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="bg-dark-900 border border-dark-800 rounded-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-12 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-xl font-bold">▶</span>
              </div>
            </Link>
            <h2 className="text-2xl font-bold mt-4">Create Account</h2>
            <p className="text-dark-400 mt-2">Join YouTube today</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avatar */}
            <div className="flex justify-center">
              <label className="cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-dark-800 border-2 border-dashed border-dark-600 flex items-center justify-center overflow-hidden hover:border-red-500 transition-colors">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <FiImage className="text-3xl text-dark-500" />
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                <p className="text-sm text-dark-400 mt-2 text-center">Upload Avatar</p>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="input-field pl-12"
                  placeholder="Enter full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Username</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input-field pl-12"
                  placeholder="Enter username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field pl-12"
                  placeholder="Enter email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input-field pl-12 pr-12"
                  placeholder="Create password (min 6 characters)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center mt-6 text-dark-400">
            Already have an account?{' '}
            <Link to="/login" className="text-red-400 hover:text-red-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
