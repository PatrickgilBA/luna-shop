// Turns a number into a nice price, e.g. 30 -> "€30.00"
export function formatPrice(euros) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(euros);
}
