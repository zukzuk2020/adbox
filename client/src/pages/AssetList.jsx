import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router';
import AssetThumbnail from '../components/AssetThumbnail';
import CenteredSpinner from '../components/CenteredSpinner';
import PageLayout from '../components/PageLayout';
import { usePageLocation } from '../hooks/usePageLocation';
import { fetchAssets } from '../store/catalogSlice';

export default function AssetList({ mode }) {
  const locationId = Number(useParams().locationId);
  const dispatch = useDispatch();
  const assets = useSelector((state) => state.catalog.assets);
  const { title } = usePageLocation(mode, locationId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchAssets()).finally(() => setLoading(false));
  }, [dispatch]);

  const crumbs = [{ label: title || 'Location', to: `/${mode}` }, { label: 'Assets' }];

  return (
    <PageLayout title={title} subtitle="Assets" crumbs={crumbs}>
      {loading ? (
        <CenteredSpinner label="Loading assets" />
      ) : (
        <div className="grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
          {assets.map((asset) => (
            <Link
              key={asset.id}
              to={`/${mode}/${locationId}/asset/${asset.id}`}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:border-blue-400 hover:shadow-md"
            >
              <AssetThumbnail type={asset.type} />
              <div className="border-t border-gray-100 px-5 py-4">
                <h3 className="text-lg font-semibold text-gray-900">{asset.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{asset.type}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
