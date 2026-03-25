import Link from 'next/link';

export default function LandingPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'linear-gradient(to bottom, #A2D2FF, #BDE0FE)' }}
    >
      <div className="flex flex-col items-center text-center max-w-sm w-full px-6">
        <h1
          className="font-playfair text-5xl font-bold mb-3"
          style={{ color: '#283618' }}
        >
          Pond Post
        </h1>
        <p
          className="font-lato text-lg mb-8"
          style={{ color: '#606C38' }}
        >
          Where kind words float freely.
        </p>

        {/* Animated envelope */}
        <div
          className="envelope-idle text-5xl mb-8 select-none"
          style={{ color: '#D4A373' }}
        >
          ✉
        </div>

        <div className="flex gap-4 mb-4">
          <Link
            href="/register"
            className="btn-primary font-lato font-semibold text-white px-6 py-3 rounded-lg"
            style={{ width: 180, textAlign: 'center', display: 'block', backgroundColor: '#606C38' }}
          >
            Start a Pond
          </Link>
          <Link
            href="/register?join=true"
            className="font-lato font-semibold text-white px-6 py-3 rounded-lg"
            style={{ width: 180, textAlign: 'center', display: 'block', backgroundColor: '#283618' }}
          >
            Join a Pond
          </Link>
        </div>

        <Link
          href="/login"
          className="font-lato text-sm underline"
          style={{ color: '#283618', opacity: 0.7 }}
        >
          Hop back into a Pond →
        </Link>
      </div>
    </main>
  );
}
