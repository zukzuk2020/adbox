import { Navigate, Route, Routes } from 'react-router';
import AssetList from './pages/AssetList';
import LocationPicker from './pages/LocationPicker';
import Review from './pages/Review';

const MODES = ['local', 'corporate'];

export default function App() {
  return (
    <Routes>
      {MODES.map((mode) => (
        <Route key={mode} path={mode}>
          <Route index element={<LocationPicker mode={mode} />} />
          <Route path=":locationId/assets" element={<AssetList mode={mode} />} />
          <Route path=":locationId/asset/:assetId" element={<Review key={mode} mode={mode} />} />
        </Route>
      ))}
      <Route path="*" element={<Navigate to="/local" replace />} />
    </Routes>
  );
}
