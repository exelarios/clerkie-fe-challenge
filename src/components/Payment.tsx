"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TextInput from "@/components/TextInput";
import RadioInput from "@/components/RadioInput";
import AccountItem from "@/components/AccountItem";
import CurrencyInput from "@/components/CurrencyInput";

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
  formattedValue: string;
}

/*
Based on: https://developer.wepay.com/docs/articles/testing
US Routing Numbers:

Must prefix with:
021000021
011401533
091000019

follow by 3-17 digits.
*/

/*

todo: Make sure values can't be negative
*/

/*
user inputs payment amount -> recalculate all selected accounts prorate

user untoggles after user controls account input -> recalculates payment amount

user controls account input & untoggles account -> recalculate payment amount
*/

function Payment(props: PaymentProps) {
  const { accounts: payload } = props;

  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [accountType, setAccountType] = useState<AccountType | null>(null);

  const [accounts, setAccounts] = useState<AccountList[]>([]);
  const [calculateProateEnabled, setCalculateProateEnabled] = useState(true);

  const totalBalance = useMemo(() => {
    const balance = payload.reduce((prev, current) => prev + current.balance, 0);
    return currencyFormat(balance);
  }, [payload]);

  const recalculatePaymentAllocated = useCallback((list: AccountList[]) => {
    return list.reduce((prev, current) => {
      if (current.enabled) {
        return prev + current.value;
      }
      
      return prev;
    }, 0);
  }, []);

  const handleOnCheckedChanged = (id: string) => {
    const updatedAccounts = accounts.map((account) => {
      if (account.name == id) {
        return {
          ...account,
          enabled: !account.enabled,
          value: account.enabled ? 0 : account.value,
          formattedValue: account.enabled ? "": account.formattedValue
        }
      }

      return account;
    });

    setCalculateProateEnabled(true);
    setAccounts(updatedAccounts);
  };
  
  const amountOfAccountsEnabled = useMemo(() => {
    return accounts.reduce((prev, current) => {
      if (current.enabled) {
        return prev + 1;
      }

      return prev;
    }, 0);
  }, [accounts, paymentAmount]);

  //  reconcile our account's object with state that is required for our UI.
  useEffect(() => {
    const accounts = payload.map((account) => {
      return {
        ...account,
        enabled: false,
        value: 0,
        formattedValue: ""
      }
    });

    setAccounts(accounts);
  }, []);

  // Invoke prorate recalculation based on dependencies.
  useEffect(() => {
    if (!calculateProateEnabled || amountOfAccountsEnabled <= 0) {
      return;
    }

    console.log("Prorate calculate");

    const selectedTotalBalance = accounts.reduce((prev, current) =>  {
      if (current.enabled) {
        return prev + current.balance;
      }

      return prev;
    }, 0);

    const updatedAccountsWithProrate = accounts.map((account) => {
      if (account.enabled) {
        const rate = account.balance / selectedTotalBalance;
        const paymentValue = Number.parseFloat(paymentAmount);
        const value = Math.round(((rate * paymentValue) + Number.EPSILON) * 100) / 100;
        return {
          ...account,
          value: value,
          // Handles the issue of displaying "NaN" by setting the formattedValue to "0".
          formattedValue: Number.isNaN(value) ? "0" : value.toString()
        };
      }

      return account;
    });

    console.log("updated", updatedAccountsWithProrate);

    setAccounts(updatedAccountsWithProrate);
  }, [paymentAmount, amountOfAccountsEnabled]);

  const handleOnAccountValueChanged = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    console.log(target.value);

    const updatedAccounts = accounts.map((account) => {
      if (account.name == id) {
        return {
          ...account,
          value: Number.parseFloat(target.value),
          formattedValue: target.value
        }
      }

      return account;
    });

    setCalculateProateEnabled(false);

    const amount = recalculatePaymentAllocated(updatedAccounts);
    setPaymentAmount(amount.toString());

    setAccounts(updatedAccounts);
  }

  const handleOnValidateAccountNumber = (value: string) => {
    return [
      {
        condition: value.length < 3,
        error: "The value is too short."
      }, {
        condition: value.length > 10,
        error: "The value is too long."
      }
    ];
  }

  return (
    <form className="bg-red-100 p-3 max-w-xl mx-auto m-10">
      <div>
        <h2 className="font-semibold text-sm">Payment Information</h2>
        <div className="my-3 grid grid-cols-2 gap-5">
          {/* todo: validate the account number. */}
          <TextInput
            label="Account Number"
            placeholder="Account number"
            value={accountNumber}
            validate={handleOnValidateAccountNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountNumber(e.target.value)}
          />
          <TextInput
            label="Confirm Account Number"
            placeholder="Account number"
            value={confirmAccountNumber}
            validate={(value) => [{ condition: value !== accountNumber, error: "Account number does not match."}]}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmAccountNumber(e.target.value)}
          />
          <TextInput
            label="Routing Number"
            placeholder="Routing number"
            value={routingNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoutingNumber(e.target.value)}
            validate={(value) => [{ condition: value.length !== 9, error: "Not a valid routing number" }]}
          />
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
            label="Payment Amount"
            placeholder="$0.00"
            value={paymentAmount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;
              setCalculateProateEnabled(true);
              setPaymentAmount(value);
            }}
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
                value={account.formattedValue}
                onCheckedChanged={handleOnCheckedChanged}
                onChange={handleOnAccountValueChanged}
              />
            );
          })}
        </div>
      </div>
      <button
        disabled={amountOfAccountsEnabled < 1}
        className="bg-brand p-3 rounded-md w-full disabled:bg-brand-subtle text-white">
        Submit
      </button>
    </form>
  );
}

export default Payment;