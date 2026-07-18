import Link from "next/link";

export default function SiteNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-zinc-900">
      <h1 className="text-2xl font-bold">Site not found</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-600">
        This published website doesn&apos;t exist or is no longer live.
      </p>
      <Link
        href="https://crestis.app"
        className="mt-6 rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white"
      >
        Go to Crestis
      </Link>
    </div>
  );
}
