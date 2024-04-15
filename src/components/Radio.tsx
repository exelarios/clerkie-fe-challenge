import { createContext, useContext, useId, useMemo } from "react";

type RadioInputProps = {
  label: string;
  children: React.ReactNode;
}

type RadioContext = {
  name: string;
}

const RadioContext = createContext<RadioContext | null>(null);

function Radio(props: RadioInputProps) {
  const { label, children } = props;

  const value = useMemo(() => {
    return {
      name: label
    }
  }, [label]);

  return (
    <RadioContext.Provider value={value}>
      <fieldset className="flex gap-x-5 py-3">
        <legend className="font-medium text-sm">{label}</legend>
        {children}
      </fieldset>
    </RadioContext.Provider>
  );
}

type RadioInputItemProps = {
  label: string;
} & React.HTMLProps<HTMLInputElement>;

function Item(props: RadioInputItemProps) {
  const { label, id: otherIds, checked, ...otherProps } = props;

  const id = useId();
  const context = useContext(RadioContext);

  return (
    <div className="flex gap-x-2">
      <input
        {...otherProps}
        checked={checked}
        className="absolute opacity-0"
        name={context?.name}
        id={id}
        type="radio"
      />
      <label
        htmlFor={id}
        className="my-auto text-subtle text-sm flex gap-x-2">
        <span className={`w-4 h-4 my-auto rounded-lg focus:outline-brand text-dark}`}/>
        {label}
      </label>
    </div>
  );
}

Radio.Item = Item;

export default Radio;