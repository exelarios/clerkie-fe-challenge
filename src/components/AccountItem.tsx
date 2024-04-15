import { useId } from "react";
import TextField from "@/components/TextField";

import currencyFormat from "@/utils/currencyFormat";

function Checkmark(props: React.HTMLProps<SVGSVGElement>) {
  return (
    <svg {...props} width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 3.72222L3.85714 6.5L9 1.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

type AccountItemProps = {
  name: string;
  balance: number;
  enabled?: boolean;
  value: string;
  errorMessage: string;
  onChange?: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckedChanged?: (id: string) => void;
}

function AccountItem(props: AccountItemProps) {
  const { name, value, balance, enabled = false, errorMessage, onChange, onCheckedChanged } = props;
  const id = useId();

  return (
    <div className="flex justify-between">
      <div className="flex gap-x-5">
        <input
          id={id}
          type="checkbox"
          className="opacity-0 absolute"
          checked={enabled}
          onChange={onCheckedChanged ? () => onCheckedChanged(name) : undefined}
        />
        <label htmlFor={id} className="flex gap-x-6">
          <span className={`
            ${enabled ? "bg-brand" : "border-2"}
            flex m-auto justify-center w-4 h-4
            rounded-sm border-text-disabled
          `}>
            {enabled ? <Checkmark className="m-auto"/> : null}
          </span>
          <div>
            <h3>{name}</h3>
            <div>
              <span className="text-subtle text-xs">Balance</span>
              <p className="text-subtle text-sm">{currencyFormat(balance)}</p>
            </div>
          </div>
        </label>
      </div>
      <TextField
        className="text-right w-28 my-auto self-end"
        disabled={!enabled}
        value={value}
        errorMessage={errorMessage}
        placeholder="$0.00"
        onChange={onChange ? (e: React.ChangeEvent<HTMLInputElement>) => onChange(name, e) : undefined}
      />
    </div>
  );
}

export default AccountItem;