import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-extrabold text-gray-200 mb-2">404</p>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Page not found</h1>
      <p className="text-sm text-gray-500 mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href="/" className="btn-primary" style={{ minWidth: 'auto' }}>
        Back to home
      </Link>
    </div>
  )
}
