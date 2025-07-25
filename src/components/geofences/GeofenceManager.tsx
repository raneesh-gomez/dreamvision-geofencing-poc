import GeofenceCreateDialog from "./GeofenceCreateDialog";
import GeofenceList from "./GeofenceList";

const GeofenceManager = () => {
    return (
        <div className="flex flex-col h-full">
            <GeofenceCreateDialog />

            <div className="mt-6 flex-1 flex flex-col overflow-hidden">
                <GeofenceList />
            </div>
        </div>
    );
};

export default GeofenceManager;
