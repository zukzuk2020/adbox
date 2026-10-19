import { Spinner } from 'flowbite-react';

export default function CenteredSpinner({ label }) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Spinner size="xl" aria-label={label} />
    </div>
  );
}
