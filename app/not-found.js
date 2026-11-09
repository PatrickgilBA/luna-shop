// Shown when someone goes to an address that doesn't exist (error 404).

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="message-page">
      <h1>Oops!</h1>
      <p>This page doesn't exist – maybe the print has flown away.</p>
      <Link href="/shop" className="button">
        Back to the shop
      </Link>
    </div>
  );
}
