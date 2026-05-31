import Link from "next/link";

export default function MassNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-2xl font-extrabold text-slate-800">Mass unavailable</h1>
      <p className="mt-4 text-slate-600">
        This date may be outside the Evangelizo feed window (about 30 days from
        today), or the readings could not be loaded.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-[#2563eb] px-6 py-3 font-bold text-white"
      >
        Back to calendar
      </Link>
    </div>
  );
}
