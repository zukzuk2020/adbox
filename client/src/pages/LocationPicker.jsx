import { Card, Label, Select, Spinner } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { fetchCorporateLocations, fetchLocalLocations } from '../store/locationsSlice';

export default function LocationPicker({ mode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const locations = useSelector((state) => state.locations[mode]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(mode === 'corporate' ? fetchCorporateLocations() : fetchLocalLocations()).finally(() => setLoading(false));
  }, [dispatch, mode]);

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      {loading ? (
        <Spinner size="xl" aria-label="Loading locations" />
      ) : (
        <Card className="w-full max-w-md">
          <p className="text-sm font-semibold tracking-wide text-blue-700 uppercase">
            {mode === 'corporate' ? 'Corporate' : 'Location'} portal
          </p>
          <Label htmlFor="location" className="text-xl font-bold">
            Choose your location
          </Label>
          <Select id="location" defaultValue="" onChange={(event) => navigate(`/${mode}/${event.target.value}/assets`)}>
            <option value="" disabled>
              Select a location…
            </option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name} ({location.location_alias})
              </option>
            ))}
          </Select>
        </Card>
      )}
    </div>
  );
}
