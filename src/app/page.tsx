import Image from "next/image";

import Payment from "@/components/Payment";

const accounts = [
  {
    name: "Account A",
    balance: 45156
  },
  {
    name: "Account B",
    balance: 14901
  },
  {
    name: "Account C",
    balance: 5438
  },
]

export default function Home() {
  return (
    <main>
      <Payment accounts={accounts}/>
      <footer className="p-10">
        <p className="text-center text-xs text-light-subtle">Deric Kwok - Clerkie's Take-home Frontend Challenge</p>
      </footer>
    </main>
  );
}
