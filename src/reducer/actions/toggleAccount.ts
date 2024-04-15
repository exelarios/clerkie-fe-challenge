import type { State, Action } from "@/reducer/payment";
import calculateProrate from "@/utils/calculateProrate";

function toggleAccount(form: State, action: Action): State {
  if (action.type !== "TOGGLE_ACCOUNT") {
    throw new Error(`Incorrect action type called; must be ${action.type}`);
  }

  const { id } = action.payload;
  const paymentValue = Number.parseFloat(form.paymentAmount.value);

  const updatedAccounts = form.accounts.map((account) => {
    if (account.name == id) {
      return {
        ...account,
        enabled: !account.enabled,
        // if the old state for that account was enabled, therefore it's 
        // being unchecked, we state the value to undefined.
        value: account.enabled ? undefined : account.value,
        formattedValue: account.enabled ? "": account.formattedValue,
        isValidated: account.message.length === 0
      }
    }

    return account;
  });

  return {
    ...form,
    accounts: calculateProrate(updatedAccounts, paymentValue)
  };
}

export default toggleAccount;