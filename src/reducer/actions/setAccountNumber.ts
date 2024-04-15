import type { State, Action } from "@/reducer/payment";

function setAccountNumber(state: State, action: Action): State {
  if (action.type !== "SET_ACCOUNT_NUMBER") {
    throw new Error(`Incorrect action type called; must be ${action.type}`);
  }

  const { value } = action.payload;
  const confirmAccountNumber = state.form.confirmAccountNumber.value;

  let message = "";
  let confirmAccountNumberMessage = "";

  if (value.length < 3) {
    message = "Your Account number is too short.";
  }

  if (value.length > 17) {
    message = "Your account number is too long";
  }

  // Needs to re-update `confirm Account number` state since it has no listeners
  // to detect if `account number` has changed from `confirm Account number`.
  if ((confirmAccountNumber.length !== 0) && value !== confirmAccountNumber) {
    confirmAccountNumberMessage = "Your account number does not match.";
  }

  return {
    ...state,
    form: {
      ...state.form,
      accountNumber: {
        ...state.form.accountNumber,
        message: message,
        isValidated: message.length !== 0,
        value: action.payload.value,
      },
      confirmAccountNumber: {
        ...state.form.confirmAccountNumber,
        message: confirmAccountNumberMessage,
        isValidated: confirmAccountNumberMessage.length !== 0
      }
    }
  };
}

export default setAccountNumber;