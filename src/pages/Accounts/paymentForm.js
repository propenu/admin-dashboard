export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const moneyInput = (value) => {
  const [whole = "", ...rest] = value.replace(/[^\d.]/g, "").split(".");
  const cleanWhole = whole.replace(/^0+(?=\d)/, "");
  return rest.length ? `${cleanWhole || "0"}.${rest.join("").slice(0, 2)}` : cleanWhole;
};

export const emptyPaymentForm = (balance, method = "cash") => ({
  method, amount: balance > 0 ? String(balance) : "", paidAt: today(),
  receivedByName: "", receiptNumber: "", payerName: "", transactionId: "", note: "",
  cheque: { instrumentType: "cheque", number: "", date: "", bankName: "", branch: "", ifsc: "", accountHolder: "", status: "received" },
  upi: { upiId: "", app: "GPay" },
  card: { cardType: "debit", network: "Visa", last4: "", cardHolder: "", approvalCode: "", terminalId: "" },
  netbanking: { transferMode: "neft", bankName: "", accountLast4: "" },
  other: { methodName: "", reference: "" },
});

export function paymentFormError(form) {
  if (!(Number(form.amount) > 0)) return "Enter the amount received";
  if (form.method === "cash" && !form.receivedByName.trim()) return "Enter who received the cash";
  if (form.method === "cheque" && (!form.cheque.number.trim() || !form.cheque.bankName.trim())) return "Cheque/DD number and bank are required";
  if (["upi", "netbanking", "razorpay"].includes(form.method) && !form.transactionId.trim()) return "Enter the transaction / UTR / payment ID";
  if (form.method === "card" && form.card.last4 && !/^\d{4}$/.test(form.card.last4)) return "Card last 4 digits must be 4 numbers";
  if (form.method === "card" && !form.transactionId.trim() && !form.card.approvalCode.trim()) return "Enter the card transaction ID or approval code";
  if (form.method === "other" && !form.other.methodName.trim()) return "Enter the payment method name";
  return "";
}

export const paymentEntry = (form) => ({
  method: form.method, amount: Number(form.amount), paidAt: form.paidAt, receivedByName: form.receivedByName, receiptNumber: form.receiptNumber,
  payerName: form.payerName, transactionId: form.transactionId, note: form.note,
  ...(form.method === "cheque" ? { cheque: form.cheque } : {}),
  ...(form.method === "upi" ? { upi: form.upi } : {}),
  ...(form.method === "card" ? { card: form.card } : {}),
  ...(form.method === "netbanking" ? { netbanking: form.netbanking } : {}),
  ...(form.method === "other" ? { other: form.other } : {}),
});
