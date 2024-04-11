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
}

function Payment(props: PaymentProps) {
  const { accounts: payload } = props;

  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [accounts, setAccounts] = useState<AccountList[]>([]);

  const totalBalance = useMemo(() => {
    const balance = payload.reduce((prev, current) => prev + current.balance, 0);
    return currencyFormat(balance);
  }, [payload]);

  useEffect(() => {
    const accounts = payload.map((account) => {
      return {
        ...account,
        enabled: false
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

  const amountOfAccountsEnabled = useMemo(() => {
    return accounts.reduce((prev, current) => {
      if (current.enabled) {
        return prev + 1;
      }

      return prev;
    }, 0);
  }, [accounts]);

  return (
    <form className="bg-red-100 p-3 max-w-xl mx-auto m-10">
      <div>
        <h2 className="font-semibold text-sm">Payment Information</h2>
        <div className="my-3 grid grid-cols-2 gap-5">
          <TextInput label="Account Number" placeholder="Account number"/>
          <TextInput
            label="Confirm Account Number"
            placeholder="Account number"
            // errorMessage="Mismatch account number."
          />
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
          <TextInput label="Payment Amount" placeholder="$0.00"/>
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