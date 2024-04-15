import round from "@/utils/round";
import type { AccountList } from "@/reducer/payment";

function calculateProrate(accounts: AccountList[], paymentAmount: number) {

  const selectedTotalBalance = accounts.reduce((prev, current) =>  {
    if (current.enabled) {
      return prev + current.balance;
    }

    return prev;
  }, 0);

  const updatedAccountsWithProrate = accounts.map((account) => {
    if (account.enabled) {
      const rate = account.balance / selectedTotalBalance;
      const value = round(rate * paymentAmount);
      return {
        ...account,
        value: value,
        // Handles the issue of displaying "NaN" by setting the formattedValue to empty string.
        formattedValue: Number.isNaN(value) ? "" : value.toString()
      };
    }

    return account;
  });

  return updatedAccountsWithProrate;
}

export default calculateProrate;