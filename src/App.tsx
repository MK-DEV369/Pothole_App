import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navigation, Coins, LogOut, Briefcase, ShieldCheck } from 'lucide-react';
import { useAuthStore } from './store/authStore';
import { supabase } from './lib/supabase';
import ReportForm from './components/ReportForm';
import PointsRedemption from './components/PointsRedemption';
import AdminDashboard from './components/AdminDashboard';
import ReportHistory from './components/Home';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';

interface UserProfileData {
  points: number;
  profile_image: string;
}

function App() {
  const { user, loading, error } = useAuthStore();
  console.log('AuthStore:', { user, loading, error });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfileData | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        console.log('Fetching user profile for:', user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('points, profile_image')
          .eq('id', user.id)
          .single();

        console.log('Supabase response:', { data, error });
        if (error) {
          console.error('Error fetching user profile:', error);
        } else {
          console.log('User profile fetched successfully:', data);
          setProfile(data);
        }
      } else {
        console.log('No user logged in');
      }
    };
    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Router>
      <div className=" bg-amber-600 bg-road flex animate-fadeIn">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } sm:hidden`}
        >
          <nav className="flex flex-col h-full p-4 space-y-4">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-gray-900">
              PotholeReporter
            </Link>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  <Navigation className="h-5 w-5 mr-2" /> Home
                </Link>
              </li>
              <li>
                <Link
                  to="/report"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  <Briefcase className="h-5 w-5 mr-2" /> Report
                </Link>
              </li>
              <li>
                <Link
                  to="/redeem"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  <Coins className="h-5 w-5 mr-2" /> Redeem
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100"
                >
                  <ShieldCheck className="h-5 w-5 mr-2" /> Admin
                </Link>
              </li>
              {!loading && user && (
                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <LogOut className="h-5 w-5 mr-2" /> Logout
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </aside>

        <div className={`fixed inset-0 bg-black bg-opacity-60 z-30 transition-opacity duration-300 ease-in-out ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        } sm:hidden`} onClick={() => setMobileMenuOpen(false)}></div>

        <div
          className={`fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md sm:hidden ${
            mobileMenuOpen ? 'hidden' : 'block'
          }`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Navigation className="h-6 w-6" />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-lg hidden sm:block">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <Link to="/" className="flex items-center group">
                <Navigation className="h-8 w-8 text-amber-600 transform transition-transform duration-300 group-hover:rotate-12" />
                <span className="ml-2 text-xl font-bold text-amber-900">PotholeReporter</span>
              </Link>
              <nav className="flex space-x-4">
                <Link
                  to="/report"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  Report
                </Link>
                <Link
                  to="/redeem"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  Redeem
                </Link>
                <Link
                  to="/admin"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  Admin
                </Link>
              </nav>
              <div className="flex items-center space-x-4">
                {!loading && user ? (
                  <>
                    <div className="flex items-center space-x-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700">
                      <img
                        src={profile?.profile_image || '/components/User.jpg'}
                        alt="User Profile"
                        className="h-5 w-5 rounded-full"
                      />
                      <Coins />
                      <span>{profile?.points || 0} Points</span>
                    </div>
                    <img
                      src={`https://ui-avatars.com/api/?name=${user.email.split('@')[0]}&background=random`}
                      alt="Avatar"
                      className="h-10 w-10 rounded-full"
                    />
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 rounded-full bg-amber-600 text-white hover:bg-amber-700 transition-all duration-300"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/sign-in"
                    className="px-6 py-2 rounded-full text-sm font-medium text-amber-700 hover:text-amber-900 hover:bg-amber-50/50 transition-all duration-300"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </header>

          {/* Main Routes */}
          <main className="container mx-auto py-8">
            <Routes>
              <Route path="/" element={<ReportHistory />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route
                path="/redeem"
                element={<PointsRedemption />}
              />
              <Route
                path="/report"
                element={<ReportForm onSuccess={() => console.log('Report submitted')} />}
              />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;