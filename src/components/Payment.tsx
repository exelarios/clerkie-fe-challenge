"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TextInput from "@/components/TextInput";
import RadioInput from "@/components/RadioInput";
import AccountItem from "@/components/AccountItem";

import round from "@/utils/round";
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
  value: number | undefined;
  formattedValue: string;
}

/*
  Only accepts valid US routing numbers based on:
  https://developer.wepay.com/docs/articles/testing
*/
function isValidRoutingNumber(value: string) {
  return value === "021000021" || value === "011401533" || value === "091000019";
}

/*
Based on: 
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

user controls account input & untoggles account -> recaluclates prorate

user selects an account, inputs an account's amount, select another 
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
    return payload.reduce((prev, current) => prev + current.balance, 0);
  }, [payload]);

  const recalculatePaymentAllocated = useCallback((list: AccountList[]) => {
    const value = list.reduce((prev, current) => {
      if (current.enabled && current.value) {
        return prev + current.value;
      }
      
      return prev;
    }, 0);

    return round(value);
  }, []);

  const handleOnCheckedChanged = (id: string) => {
    const updatedAccounts = accounts.map((account) => {
      if (account.name == id) {
        return {
          ...account,
          enabled: !account.enabled,
          // if the old state for that account was enabled, therefore it's 
          // being unchecked, we state the value to undefined.
          value: account.enabled ? undefined : account.value,
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

  // Reconcile our account's object with extra state that is required for our UI.
  useEffect(() => {
    const accounts = payload.map((account) => {
      return {
        ...account,
        enabled: false,
        value: undefined,
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
        const value = round(rate * paymentValue);
        return {
          ...account,
          value: value,
          // Handles the issue of displaying "NaN" by setting the formattedValue to empty string.
          formattedValue: Number.isNaN(value) ? "" : value.toString()
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
    setPaymentAmount(!Number.isNaN(amount) ? amount.toString() : "");

    setAccounts(updatedAccounts);
  }

  const handleOnValidateAccountNumber = (value: string) => {
    return [
      {
        condition: value.length < 3,
        error: "Your Account number is too short."
      }, {
        condition: value.length > 17,
        error: "Your Account number is too long."
      }
    ];
  }

  const handleOnValidateRoutingNumber = (value: string) => {
    return [
      { 
        condition: !isValidRoutingNumber(value),
        error: "Not a valid routing number."
      }
    ];
  }

  return (
    <form className="bg-red-100 p-5 max-w-xl mx-auto m-10">
      <div>
        <h2 className="font-semibold text-sm">Payment Information</h2>
        <div className="my-3 md:grid grid-cols-2 gap-5">
          <TextInput
            label="Account Number"
            placeholder="Account number"
            value={accountNumber}
            validate={handleOnValidateAccountNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountNumber(e.target.value)}
            onValidateChanged={(isValid) => console.log(isValid)}
          />
          <TextInput
            label="Confirm Account Number"
            placeholder="Account number"
            value={confirmAccountNumber}
            validate={(value) => [{ condition: value !== accountNumber, error: "Your Account numbers do not match."}]}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmAccountNumber(e.target.value)}
          />
          <TextInput
            label="Routing Number"
            placeholder="Routing number"
            value={routingNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRoutingNumber(e.target.value)}
            validate={handleOnValidateRoutingNumber}
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
        <div className="my-5 md:grid grid-cols-2 gap-5">
          <TextInput
            label="Payment Amount"
            placeholder="$0.00"
            value={paymentAmount}
            validate={(value) => [{ condition: Number.parseFloat(value) > totalBalance, error: "Insufficient funds" }]}
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
          <div className="flex gap-x-3 flex-wrap">
            <h2 className="font-semibold text-sm">Account Lists</h2>
            <span
              className="text-brand text-sm">
              {amountOfAccountsEnabled} Accounts Selected
            </span>
          </div>
          <span className="text-sm">Total Balance: {currencyFormat(totalBalance)}</span>
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
        className="bg-brand p-3 rounded-md w-full disabled:bg-light-brand text-white">
        Submit
      </button>
    </form>
  );
}

export default Payment;