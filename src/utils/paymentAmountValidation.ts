import type { AccountList } from "@/reducer/payment";

function paymentAmountValidation(accounts: AccountList[], value: number) {
  let message = "";

  const totalBalance = accounts.reduce((prev, current) => {
    return prev + current.balance;
  }, 0);

  // Won't recalculate prorate if the balance is over the total balance.
  const isOverBalance = value > totalBalance;
  if (isOverBalance) {
    message = "Insufficient funds.";
  }

  if (Number.isNaN(value) || value <= 0) {
    message = "Must be greater than zero.";
  }

  return message;
}

export default paymentAmountValidation;