import type { State, Action } from "@/reducer/payment";
import calculateProrate from "@/utils/calculateProrate";

import paymentAmountValidation from "@/utils/paymentAmountValidation";


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
  const isOverBalance = paymentValue > totalBalance;

  return {
    ...form,
    accounts: !isOverBalance ? calculateProrate(accounts, paymentValue) : accounts,
    paymentAmount: {
      ...form.paymentAmount,
      message: paymentAmountValidation(accounts, paymentValue),
      isValidated: message.length === 0,
      value: value
    }
  }
}

export default setPaymentAmount;
