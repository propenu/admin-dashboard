import { StatCard } from "./ReusableComaponents";
import { CheckCircle2, MapPin, Phone, ShieldCheck, UserPlus, UsersIcon } from "lucide-react";

export const StatCards = ({ stats, onStatClick, activeKey }) => {
  const cards = [
    {
      key: "total",
      label: "Total Users",
      value: stats.total,
      icon: <UsersIcon className="w-5 h-5 text-[#27AE60]" />,
      colorClass: "bg-[#27AE60]/10",
    },
    {
      key: "active",
      label: "Active",
      value: stats.active,
      icon: <CheckCircle2 className="w-5 h-5 text-[#27AE60]" />,
      colorClass: "bg-[#27AE60]/10",
    },
    {
      key: "onboarding",
      label: "Onboarding",
      value: stats.onboarding ?? 0,
      icon: <UserPlus className="w-5 h-5 text-amber-500" />,
      colorClass: "bg-amber-50",
    },
    {
      key: "joinedToday",
      label: "Joined today",
      value: stats.joinedToday ?? 0,
      icon: <UsersIcon className="w-5 h-5 text-emerald-600" />,
      colorClass: "bg-emerald-50",
    },
    {
      key: "kyc",
      label: "KYC Verified",
      value: stats.kycVerified,
      icon: <ShieldCheck className="w-5 h-5 text-blue-500" />,
      colorClass: "bg-blue-50",
    },
    {
      key: "phone",
      label: "Phone Verified",
      value: stats.phoneVerified,
      icon: <Phone className="w-5 h-5 text-purple-500" />,
      colorClass: "bg-purple-50",
    },
    {
      key: "locPending",
      label: "Loc. Pending",
      value: stats.locPending,
      icon: <MapPin className="w-5 h-5 text-amber-500" />,
      colorClass: "bg-amber-50",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
      {cards.map((card) => (
        <StatCard
          key={card.key}
          label={card.label}
          value={card.value}
          icon={card.icon}
          colorClass={card.colorClass}
          active={activeKey === card.key}
          onClick={onStatClick ? () => onStatClick(card.key) : undefined}
        />
      ))}
    </div>
  );
};
