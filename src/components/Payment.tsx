"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import TextInput from "@/components/TextInput";
import RadioInput from "@/components/RadioInput";
import AccountItem from "@/components/AccountItem";

import currencyFormat from "@/utils/currencyFormat";

type Account = {
  name: string;
  balance: number;
}

type PaymentProps = {
  accounts: Account[],
}

type AccountType = "Checking" | "Savings";

type PaymentOutput = {
  accountNumber: number;
  routingNumber: number;
  accountType: AccountType;
  paymentAmount: number;
}

interface AccountList extends Account {
  enabled: boolean;
  value: number;
}

function Payment(props: PaymentProps) {
  const { accounts: payload } = props;

  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [accounts, setAccounts] = useState<AccountList[]>([]);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const totalBalance = useMemo(() => {
    const balance = payload.reduce((prev, current) => prev + current.balance, 0);
    return currencyFormat(balance);
  }, [payload]);

  useEffect(() => {
    const accounts = payload.map((account) => {
      return {
        ...account,
        enabled: false,
        value: 0
      }
    });

    setAccounts(accounts);
  }, []);

  const handleOnCheckedChanged = useCallback((accountName: string) => {
    const updatedAccounts = accounts.map((account) => {
      if (account.name == accountName) {
        return {
          ...account,
          enabled: !account.enabled
        }
      }

      return account;
    });

    setAccounts(updatedAccounts);
  }, [accounts]);
  
  const handleOnValueChanged = useCallback((id: string, currency: CurrencyFormat) => {
    const updatedAccounts = accounts.map((account) => {
      if (account.name === id) {
        return {
          ...account,
          value: currency.value
        }
      }

      return account;
    });
    setAccounts(updatedAccounts);
  }, [accounts]);

  const amountOfAccountsEnabled = useMemo(() => {
    return accounts.reduce((prev, current) => {
      if (current.enabled) {
        return prev + 1;
      }

      return prev;
    }, 0);
  }, [accounts]);

  type CurrencyFormat = {
    formattedValue: string;
    value: number;
  }

  const onCurrencyTextChanged = useCallback((currency: CurrencyFormat) => {
    console.log(currency);
    setPaymentAmount(currency.value);
  }, [paymentAmount]);

  return (
    <form className="bg-red-100 p-3 max-w-xl mx-auto m-10">
      <div>
        <h2 className="font-semibold text-sm">Payment Information</h2>
        <div className="my-3 grid grid-cols-2 gap-5">
          {/* todo: check if confirm account matches with account number. */}
          {/* todo: validate the account number. */}
          <TextInput
            digitsOnly
            label="Account Number"
            placeholder="Account number"
            value={accountNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountNumber(e.target.value)}
          />
          <TextInput
            digitsOnly
            label="Confirm Account Number"
            placeholder="Account number"
            value={confirmAccountNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmAccountNumber(e.target.value)}
            errorMessage="Mismatch account number."
          />
          {/* todo: validate the routing account */}
          <TextInput label="Routing Number" placeholder="Routing number"/>
          <RadioInput label="Account Type">
            <RadioInput.Item
              label="Checking"
              checked={accountType === "Checking"}
              onChange={() => setAccountType("Checking")}
            />
            <RadioInput.Item
              label="Savings"
              checked={accountType === "Savings"}
              onChange={() => setAccountType("Savings")}
            />
          </RadioInput>
        </div>
      </div>
      <div className="my-7">
        <h2 className="font-semibold text-sm">Payment Detail</h2>
        <div className="my-5 grid grid-cols-2 gap-5">
          <TextInput
            currency
            label="Payment Amount"
            placeholder="$0.00"
            value={paymentAmount}
            onValueChanged={onCurrencyTextChanged}
          />
        </div>
      </div>
      <div className="my-10">
        <div className="flex justify-between">
          <div className="flex gap-x-3">
            <h2 className="font-semibold text-sm">Account Lists</h2>
            <span
              className="text-brand text-sm">
              {amountOfAccountsEnabled} Accounts Selected
            </span>
          </div>
          <span className="text-sm">Total Balance: {totalBalance}</span>
        </div>
        <div className="my-4 flex flex-col gap-y-7">
          {accounts?.map((account)=> {
            return (
              <AccountItem
                {...account}
                key={account.name}
                onCheckedChanged={() => handleOnCheckedChanged(account.name)}
                onValueChanged={handleOnValueChanged}
              />
            );
          })}
        </div>
      </div>
      <button
        disabled
        className="bg-brand p-3 rounded-md w-full disabled:bg-brand-subtle text-white">
        Submit
      </button>
    </form>
  );
}

export default Payment;