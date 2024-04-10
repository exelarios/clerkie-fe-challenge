import { useId } from "react";

type TextInputProps = {
  label?: string;
} & React.HTMLProps<HTMLInputElement>

/*
TODO:
- disabled
- error message along with error styling
*/

function TextInput(props: TextInputProps) {
  const { label, id: otherIds, className: passedClassName, disabled, ...otherProps } = props;

  const id = useId();

  return (
    <div className="flex flex-col gap-y-1">
      {label != null ?
        <label htmlFor={id} className="font-medium text-sm">{label}</label>
      : null}
      <input
        {...otherProps}
        disabled={disabled}
        id={id}
        type="text"
        className={`
          border-solid border-[1.5px] 
          disabled:bg-disabled 
          rounded-md px-3 py-[9px]
          ${disabled ? "border-disabled" : "border-border-default"} ${passedClassName}`}
      />
    </div>
  );
}

export default TextInput;