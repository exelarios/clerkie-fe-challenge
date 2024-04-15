import type { State, Action } from "@/reducer/payment";

/*
  Only accepts valid US routing numbers based on:
  https://developer.wepay.com/docs/articles/testing
*/
function isValidRoutingNumber(value: string) {
  return value === "021000021" || value === "011401533" || value === "091000019";
}

function setRoutingNumber(form: State, action: Action): State {
  if (action.type !== "SET_ROUTING_NUMBER") {
    throw new Error(`Incorrect action type called; must be ${action.type}`);
  }

  const { value } = action.payload;

  let message = "";

  if (!isValidRoutingNumber(value)) {
    message = "Not a valid routing number.";
  }

  return {
    ...form,
    routingNumber: {
      ...form.routingNumber,
      message: message,
      isValidated: message.length === 0,
      value: action.payload.value,
    }
  };
}

export default setRoutingNumber;