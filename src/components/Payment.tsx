"use client";

import { useEffect, useMemo, useReducer } from "react";

import TextField from "@/components/TextField";
import Radio from "@/components/Radio";
import AccountItem from "@/components/AccountItem";

import currencyFormat from "@/utils/currencyFormat";
import paymentReducer from "@/reducer/payment";

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

type Account = {
  name: string;
  balance: number;
}

type PaymentProps = {
  accounts: Account[],
}

const initialPaymentState = {
  calculateProrateEnabled: true,
  isSubmittable: false,
  form: {
    accountNumber: {
      isValidated: false,
      message: "",
      value: ""
    },
    confirmAccountNumber: {
      isValidated: false,
      message: "",
      value: ""
    },
    routingNumber: {
      isValidated: false,
      message: "",
      value: ""
    },
    accountType: {
      isValidated: false,
      message: "",
      value: null
    },
    paymentAmount: {
      isValidated: false,
      message: "",
      value: ""
    },
    accounts: []
  },
}

function Payment(props: PaymentProps) {
  const { accounts: payload } = props;

  const [state, dispatch] = useReducer(paymentReducer, initialPaymentState);
  const { form, isSubmittable } = state;

  const totalBalance = useMemo(() => {
    return payload.reduce((prev, current) => prev + current.balance, 0);
  }, [payload]);

  const amountOfAccountsEnabled = useMemo(() => {
    return form.accounts.reduce((prev, current) => {
      if (current.enabled) {
        return prev + 1;
      }

      return prev;
    }, 0);
  }, [form.accounts]);

  // Reconcile our account's object with extra state that is required for our UI.
  useEffect(() => {
    const accounts = payload.map((account) => {
      return {
        ...account,
        enabled: false,
        value: undefined,
        formattedValue: "",
        message: "",
        isValidated: false
      }
    });

    dispatch({
      type: "POPULATE_ACCOUNTS",
      payload: {
        accounts: accounts
      }
    });
  }, []);

  const handleOnAccountValueChanged = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target;
    dispatch({
      type: "SET_ACCOUNT_PAYMENT",
      payload: {
        id: id,
        value: target.value
      }
    });
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

  return (
    <form className="bg-red-100 p-5 max-w-xl mx-auto m-10">
      <div>
        <h2 className="font-semibold text-sm">Payment Information</h2>
        <div className="my-3 md:grid grid-cols-2 gap-5">
          <TextField
            label="Account Number"
            placeholder="Account number"
            value={form.accountNumber.value}
            errorMessage={form.accountNumber.message}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              dispatch({ type: "SET_ACCOUNT_NUMBER", payload: { value: e.target.value }})
            }}
          />
          <TextField
            label="Confirm Account Number"
            placeholder="Account number"
            value={form.confirmAccountNumber.value}
            errorMessage={form.confirmAccountNumber.message}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              dispatch({ type: "SET_CONFIRM_ACCOUNT_NUMBER", payload: { value: e.target.value }})
            }}
          />
          <TextField
            label="Routing Number"
            placeholder="Routing number"
            value={form.routingNumber.value}
            errorMessage={form.routingNumber.message}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              dispatch({ type: "SET_ROUTING_NUMBER", payload: { value: e.target.value }})
            }}
          />
          <Radio label="Account Type">
            <Radio.Item
              label="Checking"
              checked={form.accountType.value === "Checking"}
              onChange={() => {
                dispatch({ type: "SET_ACCOUNT_TYPE", payload: { value: "Checking" }})
              }}
            />
            <Radio.Item
              label="Savings"
              checked={form.accountType.value === "Savings"}
              onChange={() => {
                dispatch({ type: "SET_ACCOUNT_TYPE", payload: { value: "Savings" }})
              }}
            />
          </Radio>
        </div>
      </div>
      <div className="my-7">
        <h2 className="font-semibold text-sm">Payment Detail</h2>
        <div className="my-5 md:grid grid-cols-2 gap-5">
          <TextField
            label="Payment Amount"
            placeholder="$0.00"
            value={form.paymentAmount.value}
            errorMessage={form.paymentAmount.message}
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
          {form.accounts?.map((account)=> {
            return (
              <AccountItem
                {...account}
                key={account.name}
                value={account.formattedValue}
                errorMessage={account.message}
                onCheckedChanged={(id) => 
                  dispatch({ type: "TOGGLE_ACCOUNT", payload: { id }})
                }
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