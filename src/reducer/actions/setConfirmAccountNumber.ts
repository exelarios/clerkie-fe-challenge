import type { State, Action } from "@/reducer/payment";

function setConfirmAccountNumber(state: State, action: Action): State {
  if (action.type !== "SET_CONFIRM_ACCOUNT_NUMBER") {
    throw new Error(`Incorrect action type called; must be ${action.type}`);
  }

  const { value } = action.payload;

  let message = "";
  let isValidated = true;

  if (state.form.accountNumber.value !== value) {
    message = "Your account number does not match.";
    isValidated = false;
  }

  return {
    ...state,
    form: {
      ...state.form,
      confirmAccountNumber: {
        ...state.form.confirmAccountNumber,
        message: message,
        value: action.payload.value,
      }
    }
  };
}

export default setConfirmAccountNumber;