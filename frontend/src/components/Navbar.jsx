import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    toast.success('Logged out successfully.');
  };

  const roleBadge = {
    student: 'bg-blue-100  text-blue-800',
    staff:   'bg-purple-100 text-purple-800',
    admin:   'bg-red-100   text-red-800',
  }[user?.role] ?? '';

  return (
    <nav className="bg-brand-900 text-white px-6 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <span className="text-brand-900 font-bold text-sm">U</span>
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">University</p>
          <p className="text-blue-200 text-xs">Online Clearance System</p>
        </div>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium">{user.name}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadge}`}>
              {user.role.toUpperCase()}
              {user.department_name ? ` · ${user.department_name}` : ''}
            </span>
          </div>
          <button onClick={handleLogout}
            className="text-sm bg-white/10 hover:bg-white/20 border border-white/20
                       px-3 py-1.5 rounded-lg transition-colors">
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
}
