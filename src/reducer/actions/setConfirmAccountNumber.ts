import type { State, Action } from "@/reducer/payment";

function setConfirmAccountNumber(form: State, action: Action): State {
  if (action.type !== "SET_CONFIRM_ACCOUNT_NUMBER") {
    throw new Error(`Incorrect action type called; must be ${action.type}`);
  }

  const { value } = action.payload;
  const accountNumber = form.accountNumber.value;

  let message = "";

  if (accountNumber !== value) {
    message = "Your account number does not match.";
  }

  if (Number.isNaN(value) || value.length == 0) {
    message = "This field can not be left blank.";
  }

  return {
    ...form,
    confirmAccountNumber: {
      ...form.confirmAccountNumber,
      message: message,
      isValidated: message.length === 0,
      value: action.payload.value,
    }
  };
}

export default setConfirmAccountNumber;