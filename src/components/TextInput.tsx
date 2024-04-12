import { useId, useMemo, useRef, useState } from "react";

type TextInputProps = {
  label?: string;
  errorMessage?: string;
  currency?: boolean;
  validate?: (value: string) => boolean;
  onValueChanged?: (currencyFormat: CurrencyFormat) => void;
} & React.HTMLProps<HTMLInputElement>

function TextInput(props: TextInputProps) {
  const {
    id: otherIds,
    className: passedClassName,
    currency = false,
    label,
    errorMessage,
    disabled,
    value,
    onChange,
    onValueChanged,
    validate,
    ...otherProps 
  } = props;


  // The value will be a string.
  // anytime when the user needs the actual value, we can clean up the value as a float.

  const displayValue = useRef<string | undefined>(typeof value === "number" ? `$${value.toString()}` : "");
  const [lastKeyStroke, setLastKeyStroke] = useState<string | null>(null);
  const decimalPosition = useRef(0);
  const id = useId();

  const styles = useMemo(() => {
    if (disabled) {
      return "border-disabled";
    } else {
      if (errorMessage != null) {
        return "border-critical";
      } else {
        return "border-border-default hover:border-hover"
      }
    }
  }, [disabled, errorMessage]);

  const handleOnChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const target = event.target;
    console.log(target.selectionEnd);
    if (onValueChanged && lastKeyStroke && value != undefined) {
      if (lastKeyStroke == "Backspace") {
        console.log(value);
        if (typeof value === "number" && value < 10) {
          onValueChanged({
            value: 0,
            formattedValue: "$0"
          }); 
          displayValue.current = "$0";
          return;
        }

        const currentValue = value.toString();
        const newValue = currentValue.substring(0, currentValue.length - 1);
        displayValue.current = `$${newValue}`;
        onValueChanged({
          value: Number.parseFloat(newValue),
          formattedValue: `$${newValue}`
        });
      } else if (lastKeyStroke === ".") {
        const newValue = `${value.toString()}${lastKeyStroke}`;
        displayValue.current = `$${newValue}`;
        onValueChanged({
          value: Number.parseFloat(newValue),
          formattedValue: `$${newValue}`
        });
      } else if (Number.isInteger(Number.parseFloat(lastKeyStroke))) {
        // The regex replace removes any leading zeros.
        const newValue = `${value.toString()}${lastKeyStroke}`.replace(/^0+/, "");
        displayValue.current = `$${newValue}`;
        console.log(newValue);
        onValueChanged({
          value: Number.parseFloat(newValue),
          formattedValue: `$${newValue}`
        });
      }
    }

    if (onChange) {
      onChange(event);
    }
  }

  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const key = event.key;
    setLastKeyStroke(key);
  }

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
        value={currency ? displayValue.current : value}
        onChange={handleOnChange}
        onKeyDown={handleOnKeyDown}
        className={`
          disabled:bg-disabled 
          border-solid border-[1.5px]
          focus:border-brand
          rounded-md px-3 py-[9px]
          ${currency && value === 0 ? "text-text-subtle" : ""}
          ${styles} ${passedClassName}
        `}
      />
      <span
        className="text-critical text-xs">
        {errorMessage ? errorMessage : ""}
      </span>
    </div>
  );
}

export default TextInput;