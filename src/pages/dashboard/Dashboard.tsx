import { useNavigate } from 'react-router-dom';
import { supabase } from "./../../lib/supabase/client"
import { Toaster } from 'sonner';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import GeofenceSidebar from '@/components/maps/GeofenceSidebar';
import MapDrawing from '@/components/maps/MapDrawing';

interface DashboardProps {
    setIsAuthenticated: (value: boolean) => void;
}

function Dashboard({ setIsAuthenticated }: DashboardProps) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error.message);
        } else {
            setIsAuthenticated(false);
            navigate('/login');
        }
        
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm drop-shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-xl font-semibold">Dashboard</h1>
                        <button
                            onClick={handleLogout}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <>
                <Toaster richColors position="top-right" />
                <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                    <div className='flex'>
                    <div className='flex-col w-1/3'>
                        <GeofenceSidebar />
                    </div>
                    <div className='flex-col w-2/3'>
                        <Map
                            style={{height: '100vh'}}
                            defaultCenter={{lat: 22.54992, lng: 0}}
                            defaultZoom={3}
                            gestureHandling={'greedy'}
                            disableDefaultUI={false}
                        />
                        <MapDrawing />
                    </div>
                    </div>
                </APIProvider>
            </>
        </div>
    );
}

export default Dashboard;