import ItemsList from '../../../src/components/ItemsList';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-24">
      <div className="z-10 max-w-5xl w-full flex-col items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">Sponsoru</h1>
        <p className="text-lg text-center mb-12">
          A modern web application with Next.js, Supabase, and Heroku backend
        </p>
        
        <div className="w-full bg-white rounded-lg shadow-md p-6">
          {/* <ItemsList /> */}
        </div>
      </div>
    </main>
  );
}
