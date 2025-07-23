import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import MapDrawing from '@/components/geofences/MapDrawing';
import { useAppContext } from '@/hooks/use-app-context';
import { onLogout } from '@/services/auth.service';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import type { ActiveDashboardTabType } from '@/types';
import { ActiveDashboardTab } from '@/constants';
import OrganizationalHierarchy from '@/components/organization/OrganizationalHierarchy';
import GeofenceManager from '@/components/geofences/GeofenceManager';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState<ActiveDashboardTabType>(ActiveDashboardTab.GEOFENCES);
    const { setIsAuthenticated, setUser } = useAppContext();
    const navigate = useNavigate();

    const handleLogout = async () => {
        const error = await onLogout();
        if (error) {
            toast.error('Could not log out due to an error.');
        } else {
            setUser(null);
            setIsAuthenticated(false);
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm drop-shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <h1 className="text-xl font-semibold">DreamLink 1.0</h1>
                        <button
                            onClick={handleLogout}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
                <Card className="w-full shadow-lg rounded-2xl border border-gray-200 dark:border-gray-800">
                    <CardContent className="px-6 py-4">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex w-full items-center justify-center">
                            <TabsList className="grid w-4xl grid-cols-2 mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                <TabsTrigger
                                    value={ActiveDashboardTab.GEOFENCES}
                                    className="py-2 font-semibold data-[state=active]:bg-black data-[state=active]:text-white transition"
                                >
                                    Manage Geofences
                                </TabsTrigger>
                                <TabsTrigger
                                    value={ActiveDashboardTab.ORGANIZATION}
                                    className="py-2 font-semibold data-[state=active]:bg-black data-[state=active]:text-white transition"
                                >
                                    Organizational Hierarchy
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value={ActiveDashboardTab.GEOFENCES} className="mt-4 w-full">
                                <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                                    <div className='flex'>
                                        <div className='flex-col w-1/3'>
                                            <GeofenceManager />
                                        </div>
                                        <div className='flex-col w-2/3'>
                                            <Map
                                                style={{height: '80vh'}}
                                                defaultCenter={{lat: 22.54992, lng: 0}}
                                                defaultZoom={3}
                                                gestureHandling={'greedy'}
                                                disableDefaultUI={false}
                                            />
                                            <MapDrawing />
                                        </div>
                                    </div>
                                </APIProvider>
                            </TabsContent>

                            <TabsContent value={ActiveDashboardTab.ORGANIZATION} className="mt-4 w-full">
                                <div className='flex'>
                                    <OrganizationalHierarchy />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>

                    <CardFooter>
                        <div className="w-full px-2 text-xs text-center text-gray-400">
                            Dreamstart Labs · 2025
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

export default Dashboard;