// ============================================================================
//  THE THANK-YOU PAGE  (address: /success)
// ============================================================================
//  Stripe sends the customer back here when the payment went through, with
//  the order id in the address (?session_id=...). ClearCart uses it to
//  lower the stock.
// ============================================================================

import ClearCart from "./ClearCart";

export const metadata = { title: "Thank you!" };

export default async function SuccessPage({ searchParams }) {
  const { session_id } = await searchParams;

  return (
    <div className="message-page">
      <ClearCart sessionId={session_id} />
      <h1>Thank you! ✿</h1>
      <p>
        Your order is confirmed and a receipt is on its way to your email.
        <br />
        Your prints will be packed with love and shipped soon.
      </p>
      {/* A plain link (not Link) so the shop reloads fully and shows the new stock. */}
      <a href="/shop" className="button">
        Back to the shop
      </a>
    </div>
  );
}
