'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ru">
      <body>
        <h2>Произошла ошибка</h2>
        <p>{error.message}</p>
        <button type="button" onClick={() => reset()}>
          Попробовать снова
        </button>
      </body>
    </html>
  )
}
