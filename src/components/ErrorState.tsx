interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <h3>Something went wrong</h3>
      <p>{message}</p>
      <button className="secondary-button" type="button" onClick={onRetry}>
        Try again
      </button>
    </div>
  );
}
