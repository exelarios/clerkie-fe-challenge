import type { State, Action, AccountList } from "@/reducer/payment";
import round from "@/utils/round";

const calculatePaymentAllocated = (list: AccountList[]) => {
  const value = list.reduce((prev, current) => {
    if (current.enabled && current.value) {
      return prev + current.value;
    }
    
    return prev;
  }, 0);

  return round(value);
}

function setAccountPayment(form: State, action: Action): State {
  if (action.type !== "SET_ACCOUNT_PAYMENT") {
    throw new Error(`Incorrect action type called; must be ${action.type}`);
  }

  const { id, value } = action.payload;

  let isOverBalance = false;
  const updatedAccounts = form.accounts.map((account) => {
    if (account.name == id) {

      let message = "";
      const accountPaymentValue = Number.parseFloat(value);
      isOverBalance = accountPaymentValue > account.balance;

      if (isOverBalance) {
        message = "Insufficient funds.";
      }

      if (Number.isNaN(accountPaymentValue) || accountPaymentValue <= 0) {
        message = "Must be greater than 0.";
      }

      return {
        ...account,
        value: Number.parseFloat(value),
        message: message,
        isValidated: message.length === 0,
        formattedValue: value
      }
    }

    return account;
  });


  const paymentValue = calculatePaymentAllocated(updatedAccounts);

  return {
    ...form,
    paymentAmount: {
      ...form.paymentAmount,
      value: !isOverBalance ? paymentValue.toString() : form.paymentAmount.value,
    },
    accounts: updatedAccounts
  };
}

export default setAccountPayment;