import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavigationBar from './components/NavigationBar.tsx';
import CustomCursor from './components/CustomCursor.tsx';
import Home from './pages/Home.tsx';
import Threats from './pages/Threats.tsx';
import Pipeline from './pages/Pipeline.tsx';
import Analytics from './pages/Analytics.tsx';
import Portal from './pages/Portal.tsx';
import Dashboard from './pages/Dashboard.tsx';
import CitizenDashboard from './pages/CitizenDashboard.tsx';
import Users from './pages/Users.tsx';
import Login from './pages/Login.tsx';
import Signup from './pages/Signup.tsx';
import Footer from './components/Footer.tsx';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: string;
}

const ProtectedRoute = ({ children, allowedRole }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <CustomCursor />
      <NavigationBar />
      <main className="pt-24 min-h-screen px-4 md:px-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/threats" element={<Threats />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected Routes */}
          <Route path="/apply" element={
            <ProtectedRoute>
              <Portal />
            </ProtectedRoute>
          } />

          <Route path="/analytics" element={
            <ProtectedRoute allowedRole="admin">
              <Analytics />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute allowedRole="admin">
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/citizens" element={
            <ProtectedRoute allowedRole="admin">
              <Users />
            </ProtectedRoute>
          } />

          <Route path="/status" element={
            <ProtectedRoute allowedRole="citizen">
              <CitizenDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
