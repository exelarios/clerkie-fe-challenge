// @ts-nocheck

function currencyFormat(amount: number) {
  return Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
    // 'trailingZeroDisplay' does not exist in type 'NumberFormatOptions' for some reason
    // had to suppress type check in this file unless Vercel won't allow me to deploy.
    trailingZeroDisplay: "stripIfInteger"
  }).format(amount);
}

export default currencyFormat;