import PayPalCheckout from "@/components/PayPalCheckout";

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-md p-8">
      <h1 className="mb-2 text-2xl font-bold">Checkout</h1>
      <p className="mb-6 text-zinc-600">Complete your Developer Hoodie order.</p>
      <PayPalCheckout />
    </main>
  );
}
