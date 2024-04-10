import { useId } from "react";

type RadioInputProps = {
  label: string;
  children: React.ReactNode;
}

function RadioInput(props: RadioInputProps) {
  const { label, children } = props;
  return (
    <fieldset className="flex gap-x-5">
      <legend className="font-medium text-sm">{label}</legend>
      {children}
    </fieldset>
  );
}

type RadioInputItemProps = {
  label: string;
} & React.HTMLProps<HTMLInputElement>;

function Item(props: RadioInputItemProps) {
  const { label, id: otherIds, checked, ...otherProps } = props;

  const id = useId();

  return (
    <div className="flex gap-x-2">
      <input
        {...otherProps}
        checked={checked}
        className="absolute opacity-0"
        id={id}
        type="radio"
      />
      <label
        htmlFor={id}
        className="my-auto text-subtle text-sm flex gap-x-2">
        <span className={`w-4 h-4 my-auto rounded-lg text-dark ${checked ? "border-4 border-brand" : "border-[1.5px]"}`}/>
        {label}
      </label>
    </div>
  );
}

RadioInput.Item = Item;

export default RadioInput;