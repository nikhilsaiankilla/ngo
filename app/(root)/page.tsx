export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-white text-gray-800 font-sans">
      <header className="mb-12">
        <h1 className="text-3xl font-bold">NGO Site</h1>
      </header>

      <main className="max-w-xl w-full text-center space-y-6">
        <p>Welcome to our NGO website. We are committed to making a difference.</p>

        <nav className="flex justify-center gap-6 text-lg">
          <a href="/events" className="hover:underline">
            Events
          </a>
          <a href="/donate" className="font-semibold text-green-700 hover:underline">
            Donate
          </a>
          <a href="/services" className="hover:underline">
            Services
          </a>
          <a href="/login" className="hover:underline">
            Login
          </a>
          <a href="/about" className="hover:underline">
            About
          </a>
        </nav>
      </main>

      <footer className="mt-20 text-sm text-gray-500">
        &copy; {new Date().getFullYear()} NGO. All rights reserved.
      </footer>
    </div>
  );
}
