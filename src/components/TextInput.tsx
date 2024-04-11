import { useId, useMemo } from "react";

type TextInputProps = {
  label?: string;
  errorMessage?: string;
} & React.HTMLProps<HTMLInputElement>

function TextInput(props: TextInputProps) {
  const { label, id: otherIds, className: passedClassName, errorMessage, disabled, ...otherProps } = props;

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
        type="text"
        disabled={disabled}
        id={id}
        className={`
          disabled:bg-disabled 
          border-solid border-[1.5px]
          focus:border-brand
          rounded-md px-3 py-[9px]
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