"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
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

interface AccountList extends Account {
  enabled: boolean;
  value: number | undefined;
  formattedValue: string;
  isValidated: boolean;
}

/*
  Only accepts valid US routing numbers based on:
  https://developer.wepay.com/docs/articles/testing
*/
function isValidRoutingNumber(value: string) {
  return value === "021000021" || value === "011401533" || value === "091000019";
}

/*

todo: 
- make sure payment amount can't be negative.
- check for all form validation before allow user to press submit.
  - account number
  - confirm account number
  - account type
  - payment amount
  - accounts along with their amount inputs
  + at least one account is selected
*/

/*
user inputs payment amount -> recalculate all selected accounts prorate

user untoggles after user controls account input -> recalculates payment amount

user controls account input & untoggles account -> recaluclates prorate

user selects an account, inputs an account's amount, select another 
*/

type AccountType = "Checking" | "Savings" | null;

type FormValue<T> = {
  isValidated: boolean;
  value: T;
}

type State = {
  form: {
    accountNumber: FormValue<string>;
    confirmAccountNumber: FormValue<string>;
    routingNumber: FormValue<string>;
    accountType: FormValue<AccountType>;
    paymentAmount: FormValue<string>;
    accounts: AccountList[];
  },
  calculateProrateEnabled: boolean;
}

type Action = {
  type: "SET_ACCOUNT_NUMBER",
  payload: {
    value: string;
  }
} | {
  type: "SET_ROUTING_NUMBER",
  payload: {
    value: string;
  }
} | {
  type: "SET_CONFIRM_ACCOUNT_NUMBER",
  payload: {
    value: string;
  }
} | {
  type: "SET_ACCOUNT_TYPE",
  payload: {
    value: AccountType
  }
} | {
  type: "SET_PAYMENT_AMOUNT",
  payload: {
    value: string;
  }
} | {
  type: "SET_ACCOUNT_PAYMENT",
  payload: {
    id: string;
    value: string;
  }
} | {
  type: "POPULATE_ACCOUNTS",
  payload: {
    accounts: AccountList[]
  }
}

function paymentReducer(state: State, action: Action): State {
  const form = state.form;
  switch(action.type) {
    case "SET_ACCOUNT_NUMBER":
      return {
        ...state,
        form: {
          ...form,
          accountNumber: {
            ...form.accountNumber,
            value: action.payload.value
          }
        }
      }
    case "SET_CONFIRM_ACCOUNT_NUMBER":
      return {
        ...state,
        form: {
          ...form,
          confirmAccountNumber: {
            ...form.confirmAccountNumber,
            value: action.payload.value
          }
        }
      }
    case "SET_ROUTING_NUMBER":
      return {
        ...state,
        form: {
          ...form,
          routingNumber: {
            ...form.routingNumber,
            value: action.payload.value
          }
        }
      }
    case "SET_PAYMENT_AMOUNT": {
      return {
        ...state,
        form: {
          ...form,
          paymentAmount: {
            ...form.paymentAmount,
            value: action.payload.value
          }
        },
        calculateProrateEnabled: true,
      }
    }
    case "SET_ACCOUNT_TYPE": {
      return {
        ...state,
        form: {
          ...form,
          accountType: {
            ...form.accountType,
            value: action.payload.value
          }
        }
      }
    }
    case "POPULATE_ACCOUNTS":
      return {
        ...state,
        form: {
          ...form,
          accounts: action.payload.accounts
        }
      }
    default:
      throw new Error(`Invalid Action type passed '${action.type}' into PaymentReducer.`);
  }
}

const initialPaymentState = {
  calculateProrateEnabled: true,
  form: {
    accountNumber: {
      isValidated: false,
      value: ""
    },
    confirmAccountNumber: {
      isValidated: false,
      value: ""
    },
    routingNumber: {
      isValidated: false,
      value: ""
    },
    accountType: {
      isValidated: false,
      value: null
    },
    paymentAmount: {
      isValidated: false,
      value: ""
    },
    accounts: []
  },
}

function Payment(props: PaymentProps) {
  const { accounts: payload } = props;

  const [state, dispatch] = useReducer(paymentReducer, initialPaymentState);
  const { form, calculateProrateEnabled } = state;

  const [accounts, setAccounts] = useState<AccountList[]>([]);
  // const [calculateProrateEnabled, setCalculateProrateEnabled] = useState(true);

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

    setCalculateProrateEnabled(true);
    setAccounts(updatedAccounts);
  };
  
  const amountOfAccountsEnabled = useMemo(() => {
    return accounts.reduce((prev, current) => {
      if (current.enabled) {
        return prev + 1;
      }

      return prev;
    }, 0);
  }, [accounts, form.paymentAmount.value]);

  // Reconcile our account's object with extra state that is required for our UI.
  useEffect(() => {
    const accounts = payload.map((account) => {
      return {
        ...account,
        enabled: false,
        value: undefined,
        formattedValue: "",
        isValidated: false
      }
    });

    dispatch({
      type: "POPULATE_ACCOUNTS",
      payload: {
        accounts: accounts
      }
    });

    // add dynamic account lists onto the validation object's state.
    // for (const account of accounts) {
    //   setValidation((values) => {
    //     return {
    //       ...values,
    //       [account.name]: false
    //     }
    //   });
    // }

    setAccounts(accounts);
  }, []);

  // Invoke prorate recalculation based on dependencies.
  useEffect(() => {
    if (!calculateProrateEnabled || amountOfAccountsEnabled <= 0) {
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
        const paymentValue = Number.parseFloat(form.paymentAmount.value);
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
  }, [form.paymentAmount.value, amountOfAccountsEnabled]);

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

    setCalculateProrateEnabled(false);

    const amount = recalculatePaymentAllocated(updatedAccounts);
    setPaymentAmount(!Number.isNaN(amount) ? amount.toString() : "");

    setAccounts(updatedAccounts);
  }

  const handleOnPaymentAmountChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // setCalculateProrateEnabled(true);
    dispatch({
      type: "SET_PAYMENT_AMOUNT",
      payload: {
        value: value
      }
    });
  }

  const handleOnAccountValidationChanged = useCallback((id: string, isValid: boolean) => {
  }, []);

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

  const isFormSubmittable = useMemo(() => {
    return false;
  }, []);

  console.log(state);

  return (
    <form className="bg-red-100 p-5 max-w-xl mx-auto m-10">
      <div>
        <h2 className="font-semibold text-sm">Payment Information</h2>
        <div className="my-3 md:grid grid-cols-2 gap-5">
          <TextInput
            label="Account Number"
            placeholder="Account number"
            value={form.accountNumber.value}
            validate={handleOnValidateAccountNumber}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch({ type: "SET_ACCOUNT_NUMBER", payload: { value: e.target.value }})}
          />
          <TextInput
            label="Confirm Account Number"
            placeholder="Account number"
            value={form.confirmAccountNumber.value}
            validate={(value) => [{ condition: value !== form.accountNumber.value, error: "Your Account numbers do not match."}]}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch({ type: "SET_CONFIRM_ACCOUNT_NUMBER", payload: { value: e.target.value }})}
          />
          <TextInput
            label="Routing Number"
            placeholder="Routing number"
            value={form.routingNumber.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => dispatch({ type: "SET_ROUTING_NUMBER", payload: { value: e.target.value }})}
            validate={handleOnValidateRoutingNumber}
          />
          <RadioInput label="Account Type">
            <RadioInput.Item
              label="Checking"
              checked={form.accountType.value === "Checking"}
              onChange={() => dispatch({ type: "SET_ACCOUNT_TYPE", payload: { value: "Checking" }})}
            />
            <RadioInput.Item
              label="Savings"
              checked={form.accountType.value === "Savings"}
              onChange={() => dispatch({ type: "SET_ACCOUNT_TYPE", payload: { value: "Savings" }})}
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
            value={form.paymentAmount.value}
            validate={(value) => [{ condition: Number.parseFloat(value) > totalBalance, error: "Your payment amount can not be more than your total balance." }]}
            onChange={handleOnPaymentAmountChanged}
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
                onValidateChanged={handleOnAccountValidationChanged}
                onChange={handleOnAccountValueChanged}
              />
            );
          })}
        </div>
      </div>
      <button
        disabled={amountOfAccountsEnabled < 1 || (form.accountType.value !== "Checking" && form.accountType.value !== "Savings")}
        className="bg-brand p-3 rounded-md w-full disabled:bg-light-brand text-white">
        Submit
      </button>
    </form>
  );
}

export default Payment;