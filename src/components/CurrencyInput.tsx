import TextInput from "@/components/TextInput";
import { useRef, useState } from "react";

const PREFIX = "$";

export const addSeparators = (value: string, separator = ','): string => {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

function formatValue(value: string): string {
  return `${PREFIX}${addSeparators(value)}`;
}

function cleanValue(value: string): number {
  return Number.parseFloat(value.replace(/\$|,/, ""));
}

type CurrencyInputProps = {
  onValueChanged: (values: CurrencyFormat) => void;
}

function CurrencyInput(props: any) {
  const { value, onValueChanged } = props;

  const displayValue = useRef(value);
  const decimalPosition = useRef(0);
  const [lastKeyStroke, setLastKeyStroke] = useState<string | null>(null);

  const handleOnChange = () => {
    /*
      Allowed Tokens:
      All digits: 0-9
      One period: .
    */

    if (onValueChanged !== undefined) {
      const newValue = `${displayValue.current}${lastKeyStroke}`;
      displayValue.current = newValue;
      onValueChanged({
        formattedValue: formatValue(newValue),
        value: cleanValue(newValue)
      });
    }
  }

  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const key = event.key;
    setLastKeyStroke(key);
  }

  return (
    <TextInput {...props}/>
  );
}

export default CurrencyInput;