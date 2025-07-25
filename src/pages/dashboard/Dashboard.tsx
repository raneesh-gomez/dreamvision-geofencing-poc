import { APIProvider, Map } from '@vis.gl/react-google-maps';
import MapDrawing from '@/components/geofences/MapDrawing';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import type { ActiveDashboardTabType } from '@/types';
import { ActiveDashboardTab } from '@/constants';
import OrganizationalHierarchy from '@/components/organization/OrganizationalHierarchy';
import GeofenceManager from '@/components/geofences/GeofenceManager';
import { MapPin, Network } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import OrganizationalWidgets from '@/components/organization/OrganizationalWidgets';
import { useGeofenceContext } from '@/hooks/use-geofence-context';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
    const { drawingEnabled, stopDrawing } = useGeofenceContext();
    const [activeTab, setActiveTab] = useState<ActiveDashboardTabType>(ActiveDashboardTab.GEOFENCES);

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-gray-100">
            <div className="flex-1 flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-950 px-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full items-center justify-center">
                    <TabsList className="relative inline-flex mt-4 bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden p-1">
                        <TabsTrigger
                            value={ActiveDashboardTab.GEOFENCES}
                            className="group relative z-10 w-80 px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-100 data-[state=active]:text-white transition-colors data-[state=active]:bg-black rounded-md hover:cursor-pointer"
                            disabled={drawingEnabled}
                        >
                            <MapPin className="w-4 h-4" />
                            Manage Geofences
                        </TabsTrigger>
                        <TabsTrigger
                            value={ActiveDashboardTab.ORGANIZATION}
                            className="group relative z-10 w-80 px-4 py-2 flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-100 data-[state=active]:text-white transition-colors data-[state=active]:bg-black rounded-md hover:cursor-pointer"
                            disabled={drawingEnabled}
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
                                        <CardTitle className="text-lg">📍 Manage Geofences</CardTitle>
                                        <CardDescription className="text-sm">
                                            Create, edit, and manage geofences with intuitive controls. Select a geofence to view more details.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-hidden px-4">
                                        <GeofenceManager />
                                    </CardContent>
                                </Card>

                                {/* Map View */}
                                <Card className="flex flex-col w-2/3">
                                    <CardHeader className='flex flex-row items-center justify-between'>
                                        <div className='flex flex-col items-start justify-start gap-1.5'>
                                            <CardTitle className="text-lg">🗺️ Interactive Map</CardTitle>
                                            <CardDescription className="text-sm">
                                                Visualize geofences on a live map. Draw new boundaries or adjust existing ones with precision and instant feedback.
                                            </CardDescription>
                                        </div>
                                        {drawingEnabled && (
                                            <Button variant="destructive" className="hover:cursor-pointer" onClick={stopDrawing} disabled={!drawingEnabled}>
                                                Stop Drawing
                                            </Button>
                                        )}
                                    </CardHeader>
                                    <CardContent className="flex-1 overflow-hidden px-4">
                                        <Map
                                            style={{ height: "100%", width: "100%" }}
                                            defaultCenter={{ lat: 22.54992, lng: 0 }}
                                            defaultZoom={3}
                                            gestureHandling={"greedy"}
                                            disableDefaultUI={false}
                                            streetViewControl={false}
                                            fullscreenControl={false}
                                        />
                                        <MapDrawing />
                                    </CardContent>
                                </Card>
                            </div>
                        </APIProvider>
                    </TabsContent>

                    <TabsContent value={ActiveDashboardTab.ORGANIZATION} className="flex-1 flex overflow-hidden w-full pt-4">
                        <Card className="flex flex-col w-5/6">
                            <CardHeader>
                                <CardTitle className="text-lg">💼 Organizational Hierarchy</CardTitle>
                                <CardDescription className="text-sm">
                                    Use this panel to explore how your organizational units are connected — and who reports to whom.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden p-4">
                                <OrganizationalHierarchy />
                            </CardContent>
                        </Card>
                        <OrganizationalWidgets />
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