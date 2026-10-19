import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCorporateLocations, fetchLocalLocations } from '../store/locationsSlice';

/** Loads the list for the page's mode and returns the selected location plus the page title. */
export function usePageLocation(mode, locationId) {
  const dispatch = useDispatch();
  const list = useSelector((state) => state.locations[mode]);

  useEffect(() => {
    dispatch(mode === 'corporate' ? fetchCorporateLocations() : fetchLocalLocations());
  }, [dispatch, mode]);

  const location = list.find((l) => l.id === locationId);
  return { location, title: mode === 'corporate' ? 'Corporate' : (location?.name ?? '') };
}
