import Link from "next/link";

export default function ShopPage() {
  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-2 text-2xl font-bold">Shop</h1>
      <p className="mb-6 text-zinc-600">Browse the Developer Hoodie.</p>
      <Link
        href="/checkout"
        className="rounded bg-[#003087] px-4 py-2 font-medium text-white"
      >
        View checkout
      </Link>
    </main>
  );
}
