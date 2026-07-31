export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="rounded-[2rem] border border-white/50 bg-white/70 p-8 text-center backdrop-blur">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          NiWa
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-foreground">Page Not Found</h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          The page you requested does not exist in the current NiWa console route set.
        </p>
      </div>
    </main>
  );
}
