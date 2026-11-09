// ============================================================================
//  TACK-SIDAN  (adress: /success)
// ============================================================================
//  Stripe skickar tillbaka kunden hit när betalningen gick igenom, med
//  köpets id i adressen (?session_id=...). ClearCart använder det för att
//  räkna ner lagret.
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
      {/* Vanlig länk (inte Link) så att butiken laddas om helt och visar det nya lagret. */}
      <a href="/shop" className="button">
        Back to the shop
      </a>
    </div>
  );
}
