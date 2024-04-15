import round from "@/utils/round";

import type { State, Action } from "@/reducer/payment";
import calculateProrate from "@/utils/calculateProrate";

function setPaymentAmount(form: State, action: Action): State {
  if (action.type !== "SET_PAYMENT_AMOUNT") {
    throw new Error(`Incorrect action type called; must be ${action.type}`);
  }

  let message = "";
  const accounts = form.accounts;
  const { value } = action.payload;

  const totalBalance = accounts.reduce((prev, current) => {
    return prev + current.balance;
  }, 0);

  const paymentValue = Number.parseFloat(value);

  // Won't recalculate prorate if the balance is over the total balance.
  const isOverBalance = paymentValue > totalBalance;
  if (isOverBalance) {
    message = "Insufficient funds.";
  }

  if (Number.isNaN(paymentValue) || paymentValue <= 0) {
    message = "Must be greater than zero.";
  }

  return {
    ...form,
    accounts: !isOverBalance ? calculateProrate(accounts, paymentValue) : accounts,
    paymentAmount: {
      ...form.paymentAmount,
      message: message,
      isValidated: message.length === 0,
      value: value
    }
  }
}

export default setPaymentAmount;