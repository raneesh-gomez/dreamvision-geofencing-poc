import {APIProvider, Map} from '@vis.gl/react-google-maps';
import './App.css'
import MapDrawing from './components/maps/MapDrawing';
import GeofenceSidebar from './components/maps/GeofenceSidebar';
import { useGeofenceStore } from './hooks/use-geofence-store';

function App() {
  const {
    geofences,
    drawingEnabled,
    startDrawing,
    completeDrawing,
  } = useGeofenceStore();
  
  return (
    <APIProvider apiKey="AIzaSyALV8ZgXOCRHB4A3zv942lFvmXugRUOd1g">
      <div className='flex'>
        <div className='flex-col w-1/6'>
          <GeofenceSidebar 
            geofences={geofences.map(g => ({ id: g.id, name: g.metadata.name }))}
            onSubmit={startDrawing}
          />
        </div>
        <div className='flex-col w-5/6'>
          <Map
            style={{height: '100vh'}}
            defaultCenter={{lat: 22.54992, lng: 0}}
            defaultZoom={3}
            gestureHandling={'greedy'}
            disableDefaultUI={true}
          />
          <MapDrawing 
            drawingEnabled={drawingEnabled}
            onPolygonComplete={completeDrawing}
          />
        </div>
      </div>
      
  </APIProvider>
  )
}

export default App
