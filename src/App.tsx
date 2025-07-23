import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/login/LoginPage';
import Dashboard from './pages/dashboard/Dashboard';
import { useState } from 'react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <LoginPage setIsAuthenticated={setIsAuthenticated} />
        } />
        <Route path="/dashboard" element={
          isAuthenticated ? (
            <Dashboard setIsAuthenticated={setIsAuthenticated} />
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
  // return (
  //   <>
  //     <Toaster richColors position="top-right" />
  //     <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
  //       <div className='flex'>
  //         <div className='flex-col w-1/3'>
  //           <GeofenceSidebar />
  //         </div>
  //         <div className='flex-col w-2/3'>
  //           <Map
  //             style={{height: '100vh'}}
  //             defaultCenter={{lat: 22.54992, lng: 0}}
  //             defaultZoom={3}
  //             gestureHandling={'greedy'}
  //             disableDefaultUI={false}
  //           />
  //           <MapDrawing />
  //         </div>
  //       </div>
  //   </APIProvider>
  // </>
  // )
}

export default App
