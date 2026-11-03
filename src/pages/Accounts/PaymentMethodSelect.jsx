import {
  AlertTriangle, BadgeIndianRupee, Banknote, CheckCircle2, Clock3, CreditCard,
  Landmark, PieChart, Smartphone, WalletCards,
} from "lucide-react";
import BrandSelect from "./BrandSelect";

const METHODS = [
  { value: "cash", label: "Cash", hint: "Paid at the office", icon: Banknote, tone: "bg-emerald-100 text-emerald-700" },
  { value: "cheque", label: "Cheque", hint: "Cheque or DD", icon: WalletCards, tone: "bg-amber-100 text-amber-700" },
  { value: "upi", label: "UPI", hint: "GPay, PhonePe, Paytm", icon: Smartphone, tone: "bg-violet-100 text-violet-700" },
  { value: "card", label: "Card", hint: "Debit or credit card", icon: CreditCard, tone: "bg-sky-100 text-sky-700" },
  { value: "netbanking", label: "Net banking", hint: "Bank transfer, NEFT, RTGS", icon: Landmark, tone: "bg-indigo-100 text-indigo-700" },
  { value: "razorpay", label: "Razorpay", hint: "Online payment link", icon: BadgeIndianRupee, tone: "bg-blue-100 text-blue-700" },
];

const STATUSES = [
  { value: "pending", label: "Pending", hint: "Waiting for payment", icon: Clock3, tone: "bg-amber-100 text-amber-700" },
  { value: "paid", label: "Paid", hint: "Full amount received", icon: CheckCircle2, tone: "bg-emerald-100 text-emerald-700" },
  { value: "partial", label: "Partial", hint: "Part of the amount received", icon: PieChart, tone: "bg-sky-100 text-sky-700" },
  { value: "failed", label: "Failed", hint: "Payment did not go through", icon: AlertTriangle, tone: "bg-rose-100 text-rose-700" },
];

export default function PaymentMethodSelect({ value, onChange }) {
  return <BrandSelect value={value} onChange={onChange} options={METHODS} title="Payment method" />;
}

export function PaymentStatusSelect({ value, onChange }) {
  return <BrandSelect value={value} onChange={onChange} options={STATUSES} title="Payment status" />;
}
