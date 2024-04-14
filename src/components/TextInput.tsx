import { useEffect, useId, useMemo, useState } from "react";

type Validation = {
  condition: boolean;
  error: string;
}

type TextInputProps = {
  label?: string;
  value?: string;
  validate?: (value: string) => Validation[];
  onValueChanged?: (currencyFormat: CurrencyFormat) => void;
  onValidateChanged?: (isValid: boolean) => void;
} & React.HTMLProps<HTMLInputElement>

function TextInput(props: TextInputProps) {
  const {
    id: otherIds,
    className: passedClassName,
    label,
    disabled,
    value,
    validate,
    onValidateChanged,
    ...otherProps 
  } = props;

  const id = useId();
  const [errorMessage, setErrorMessage] = useState("");

  const styles = useMemo(() => {
    if (disabled) {
      return "border-disabled";
    } else if (errorMessage.length > 0) {
      return "border-critical focus:outline-light-critical focus:border-critical";
    } else {
      return "border-border-default hover:border-hover"
    }
  }, [disabled, errorMessage]);

  useEffect(() => {
    if (!value) return;

    let isValid = true;
    setErrorMessage("");
    if (validate && value != undefined) {
      const tests = validate(value);
      for (const test of tests) {
        if (test.condition) {
          isValid = false;
          setErrorMessage(test.error);
        }
      }

      if (onValidateChanged) {
        onValidateChanged(isValid);
      }
    }
  }, [validate, value]);

  return (
    <div className="flex flex-col gap-y-1">
      {label != null ?
        <label
          htmlFor={id}
          className="font-medium text-sm">
          {label}
        </label>
      : null}
      <input
        {...otherProps}
        id={id}
        type="text"
        disabled={disabled}
        value={value}
        className={`
          disabled:bg-disabled 
          border-solid border-[1.5px]
          focus:border-brand
          rounded-md px-3 py-[9px]
          ${styles} ${passedClassName}
        `}
      />
      <span className="text-critical text-xs h-3 mb-2 md:mb-0">
        {errorMessage}
      </span>
    </div>
  );
}

export default TextInput;