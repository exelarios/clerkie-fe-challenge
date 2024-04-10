function currencyFormat(amount: number) {
  return Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
    trailingZeroDisplay: "stripIfInteger"
  }).format(amount);
}

export default currencyFormat;