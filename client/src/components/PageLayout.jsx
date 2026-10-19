import Breadcrumbs from './Breadcrumbs';
import NoticeToast from './NoticeToast';

export default function PageLayout({ title, subtitle, crumbs, notice, fill = false, children }) {
  return (
    <div className={`flex flex-col ${fill ? 'h-screen' : 'min-h-screen'}`}>
      <header className="shrink-0 border-b border-gray-200 bg-white px-8 py-5">
        {crumbs && <Breadcrumbs crumbs={crumbs} />}
        <h1 className="mt-2 text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <h2 className="mt-1 text-sm font-semibold tracking-wide text-gray-500 uppercase">{subtitle}</h2>}
      </header>
      <NoticeToast notice={notice} />
      <main className={`flex min-h-0 flex-1 flex-col ${fill ? '' : 'p-8'}`}>{children}</main>
    </div>
  );
}
