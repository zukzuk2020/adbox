import { Toast, ToastToggle } from 'flowbite-react';

const VARIANTS = {
  success: {
    iconClass: 'bg-green-100 text-green-600',
    path: 'M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.58l7.3-7.3a1 1 0 0 1 1.4 0Z',
  },
  failure: {
    iconClass: 'bg-red-100 text-red-600',
    path: 'M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1Zm0 8.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z',
  },
};

/** Give each notice a new `id`: the key remounts the toast and replays the slide animation. */
export default function NoticeToast({ notice }) {
  if (!notice) return null;
  const variant = VARIANTS[notice.color];
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center">
      <div key={notice.id} className="notice-toast pointer-events-auto">
        <Toast className="max-w-md">
          <div className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${variant.iconClass}`}>
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="size-5">
              <path fillRule="evenodd" clipRule="evenodd" d={variant.path} />
            </svg>
          </div>
          <div className="ml-3 text-sm font-normal text-gray-700">{notice.message}</div>
          <ToastToggle />
        </Toast>
      </div>
    </div>
  );
}
