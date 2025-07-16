import {APIProvider, Map} from '@vis.gl/react-google-maps';
import MapDrawing from './components/maps/MapDrawing';
import GeofenceSidebar from './components/maps/GeofenceSidebar';
import { Toaster } from './components/ui/sonner';

function App() {
  return (
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
  )
}

export default App
