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

function setAccountPayment(state: State, action: Action): State {
  if (action.type !== "SET_ACCOUNT_PAYMENT") {
    throw new Error(`Incorrect action type called; must be ${action.type}`);
  }

  const form = state.form;
  const { id, value } = action.payload;

  const updatedAccounts = form.accounts.map((account) => {
    if (account.name == id) {

      let message = "";
      const accountPaymentValue = Number.parseFloat(value);
      const isOverBalance = accountPaymentValue > account.balance;

      if (isOverBalance) {
        message = "Insufficient funds.";
      }

      return {
        ...account,
        value: Number.parseFloat(value),
        message: message,
        isValidated: message.length !== 0,
        formattedValue: value
      }
    }

    return account;
  });


  const paymentValue = calculatePaymentAllocated(updatedAccounts);

  return {
    ...state,
    form: {
      ...form,
      paymentAmount: {
        ...form.paymentAmount,
        value: paymentValue.toString()
      },
      accounts: updatedAccounts
    },
    calculateProrateEnabled: false
  };
}

export default setAccountPayment;