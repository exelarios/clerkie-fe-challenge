import { useId, useMemo } from "react";

type TextFieldProps = {
  label?: string;
  value?: string;
  digitsOnly?: boolean;
  errorMessage?: string;
} & React.HTMLProps<HTMLInputElement>;

function TextField(props: TextFieldProps) {
  const {
    id: otherIds,
    className: passedClassName,
    label,
    disabled,
    value,
    digitsOnly = false,
    errorMessage = "",
    onChange,
    ...otherProps 
  } = props;

  const id = useId();

  const styles = useMemo(() => {
    if (disabled) {
      return "border-disabled";
    } else if (errorMessage?.length > 0) {
      return "border-critical focus:outline-light-critical focus:border-critical";
    } else {
      return "border-border-default hover:border-hover"
    }
  }, [disabled, errorMessage]);

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange == undefined) return;

    const target = event.target;
    const value = target.value;

    // Only allow tokens: [0-9] | .
    if (digitsOnly) {
      const regex = new RegExp(/^[0-9]*(\.[0-9]*)?$/);
      const isOnlyDigits = regex.test(value);

      isOnlyDigits && onChange(event);
    } else {
      onChange(event);
    }
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
        onChange={handleOnChange}
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

export default TextField;