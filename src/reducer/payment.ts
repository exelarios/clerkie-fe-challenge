import setAccountNumber from "./actions/setAccountNumber";
import setAccountPayment from "./actions/setAccountPayment";
import setConfirmAccountNumber from "./actions/setConfirmAccountNumber";
import setPaymentAmount from "./actions/setPaymentAmount";
import setRoutingNumber from "./actions/setRoutingNumber";
import toggleAccount from "./actions/toggleAccount";

type Account = {
  name: string;
  balance: number;
}

export interface AccountList extends Account {
  enabled: boolean;
  value: number | undefined;
  formattedValue: string;
  message: string;
  isValidated: boolean;
}

type AccountType = "Checking" | "Savings" | null;

type FormValue<T> = {
  isValidated: boolean;
  message: string;
  value: T;
}

export type State = {
  form: {
    accountNumber: FormValue<string>;
    confirmAccountNumber: FormValue<string>;
    routingNumber: FormValue<string>;
    accountType: FormValue<AccountType>;
    paymentAmount: FormValue<string>;
    accounts: AccountList[];
  },
  isSubmittable: boolean;
  calculateProrateEnabled: boolean;
}

export type Action = {
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
} | {
  type: "TOGGLE_ACCOUNT",
  payload: {
    id: string;
  }
}

function paymentReducer(state: State, action: Action): State {
  const form = state.form;
  switch(action.type) {
    case "SET_ACCOUNT_NUMBER": {
      return setAccountNumber(state, action);
    }
    case "SET_CONFIRM_ACCOUNT_NUMBER": {
      return setConfirmAccountNumber(state, action);
    }
    case "SET_ROUTING_NUMBER": {
      return setRoutingNumber(state, action);
    }
    case "SET_PAYMENT_AMOUNT": {
      return setPaymentAmount(state, action);
    }
    case "TOGGLE_ACCOUNT": {
      return toggleAccount(state, action);
    }
    case "SET_ACCOUNT_PAYMENT": {
      return setAccountPayment(state, action);
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

export default paymentReducer;