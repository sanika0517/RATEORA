import Button from './Button'

export default function ErrorState({ title = 'Unable to load this view', description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-card px-6 py-16 text-center">
      <h3 className="text-base font-medium text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm text-muted">{description}</p>}
      {onRetry && (
        <Button className="mt-5" type="button" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
