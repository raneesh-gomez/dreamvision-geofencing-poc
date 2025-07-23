import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login/Login';
import Dashboard from './pages/dashboard/Dashboard';
import { useAppContext } from './hooks/use-app-context';

function App() {
  const { isAuthenticated } = useAppContext();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <Login />
        } />
        <Route path="/dashboard" element={
          isAuthenticated ? (
            <Dashboard />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path="*" element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        } />
      </Routes>
    </Router>
  );
}

export default App
