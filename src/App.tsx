import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login/Login';
import Dashboard from './pages/dashboard/Dashboard';
import NotFound from './pages/notFound/NotFound';
import { useAppContext } from './hooks/use-app-context';
import { Toaster } from 'sonner';
import { Header } from './components/ui/top-bar';
import Profile from './pages/profile/Profile';

function App() {
  const { isAuthenticated } = useAppContext();

  return (
    <>
      <Toaster richColors position="top-right" />
      <Router>
        <Routes>
          <Route path="/profile" element={
            isAuthenticated ? (
              <>
                <Header />
                <Profile />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/dashboard" element={
            isAuthenticated ? (
              <>
                <Header />
                <Dashboard />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/login" element={
            <Login />
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>

      </Router>
    </>

  );
}

export default App
