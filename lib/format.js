// Gör om ett tal till ett snyggt pris, t.ex. 30 -> "€30.00"
export function formatPrice(euros) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(euros);
}
