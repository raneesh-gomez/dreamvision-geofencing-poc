import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { APIProvider, Map } from '@vis.gl/react-google-maps';
import MapDrawing from '@/components/geofences/MapDrawing';
import { useAppContext } from '@/hooks/use-app-context';
import { onLogout } from '@/services/auth.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import type { ActiveDashboardTabType } from '@/types';
import { ActiveDashboardTab } from '@/constants';
import OrganizationalHierarchy from '@/components/organization/OrganizationalHierarchy';
import GeofenceManager from '@/components/geofences/GeofenceManager';
import { MapPin, Network } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';

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
        <div className="flex flex-col h-screen bg-gray-100">
            <nav className="flex items-center justify-between px-6 h-16 bg-white shadow-sm drop-shadow-md">
                <h1 className="text-xl font-semibold">DreamLink 1.0</h1>
                <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-gray-900"
                >
                    Logout
                </button>
            </nav>

            <div className="flex-1 flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-950 px-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full items-center justify-center">
                    <TabsList className="relative inline-flex mt-4 bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden p-1">
                        <TabsTrigger
                            value={ActiveDashboardTab.GEOFENCES}
                            className="group relative z-10 w-80 px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-100 data-[state=active]:text-white transition-colors data-[state=active]:bg-black rounded-md"
                        >
                            <MapPin className="w-4 h-4" />
                            Manage Geofences
                        </TabsTrigger>
                        <TabsTrigger
                            value={ActiveDashboardTab.ORGANIZATION}
                            className="group relative z-10 w-80 px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-100 data-[state=active]:text-white transition-colors data-[state=active]:bg-black rounded-md"
                        >
                            <Network className="w-4 h-4" />
                            Organizational Hierarchy
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={ActiveDashboardTab.GEOFENCES} className="flex-1 flex overflow-hidden w-full pt-4">
                        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
                            <div className="flex w-full gap-4 h-full">
                                {/* Geofence Manager */}
                                <Card className="flex flex-col w-1/3">
                                    <CardHeader>
                                        <CardTitle className="text-lg">📍 Manage your Geofences</CardTitle>
                                        <CardDescription className="text-sm">
                                            Create, edit, and manage geofences with intuitive controls. Select a geofence to view its details or update its structure in real time.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-hidden p-4">
                                        <GeofenceManager />
                                    </CardContent>
                                </Card>

                                {/* Map View */}
                                <Card className="flex flex-col w-2/3">
                                    <CardHeader>
                                        <CardTitle className="text-lg">🗺️ Interactive Map</CardTitle>
                                        <CardDescription className="text-sm">
                                            Visualize geofences on a live map. Draw new boundaries or adjust existing ones with precision and instant feedback.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-hidden p-4">
                                        <Map
                                            style={{ height: "100%", width: "100%" }}
                                            defaultCenter={{ lat: 22.54992, lng: 0 }}
                                            defaultZoom={3}
                                            gestureHandling={"greedy"}
                                            disableDefaultUI={false}
                                        />
                                        <MapDrawing />
                                    </CardContent>
                                    {/* TODO Add geofence widgets panel */}
                                </Card>
                            </div>
                        </APIProvider>
                    </TabsContent>

                    <TabsContent value={ActiveDashboardTab.ORGANIZATION} className="flex-1 flex overflow-hidden w-full pt-4">
                        <Card className="flex flex-col w-full">
                            <CardHeader>
                                <CardTitle className="text-lg">Organizational Hierarchy</CardTitle>
                                <CardDescription className="text-sm">
                                    Use this panel to explore how your organizational units are connected — and who reports to whom.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden p-4">
                                <OrganizationalHierarchy />
                            </CardContent>
                        </Card>
                        {/* TODO Add geofence widgets panel */}
                    </TabsContent>

                    <div className='flex items-center justify-center text-center py-2'>
                        <p className='text-sm text-gray-400'>© 2025 Dreamstart Labs</p>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}

export default Dashboard;