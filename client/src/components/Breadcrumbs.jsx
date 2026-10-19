import { Link } from 'react-router';

/** Crumbs with a `to` are links; the last crumb is the current page. */
export default function Breadcrumbs({ crumbs }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        {crumbs.map((crumb, index) => (
          <li key={crumb.label} className="flex items-center gap-2">
            {index > 0 && (
              <span aria-hidden="true" className="inline-block size-1.5 rotate-45 border-t border-r border-gray-400" />
            )}
            {crumb.to ? (
              <Link to={crumb.to} className="hover:text-blue-700 hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-medium text-gray-700">
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
