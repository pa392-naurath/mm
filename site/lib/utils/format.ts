export const formatPrice = (price: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);

export const safeJson = <T>(value: T) => JSON.parse(JSON.stringify(value)) as T;
