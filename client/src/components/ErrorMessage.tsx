interface Props {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: Props) {
  return (
    <div role="alert" className="flex flex-col gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="self-start rounded-md bg-red-600 px-3 py-1.5 font-medium text-white hover:bg-red-700 sm:self-auto"
        >
          Retry
        </button>
      )}
    </div>
  );
}