import { StatCard } from "./ReusableComaponents";
import { CalendarDays, MapPin, Phone, ShieldCheck, User, Users } from "lucide-react";

export const StatCards = ({ stats, onStatClick, activeKey }) => {
  const cards = [
    {
      key: "total",
      label: "Total Users",
      value: stats.total,
      emphasize: true,
      icon: <Users className="h-4 w-4" aria-hidden />,
    },
    {
      key: "active",
      label: "Active",
      value: stats.active,
      highlightValue: true,
      icon: <User className="h-4 w-4" aria-hidden />,
    },
    {
      key: "joinedToday",
      label: "Joined Today",
      value: stats.joinedToday ?? 0,
      icon: <CalendarDays className="h-4 w-4" aria-hidden />,
    },
    {
      key: "kyc",
      label: "KYC Verified",
      value: stats.kycVerified,
      icon: <ShieldCheck className="h-4 w-4" aria-hidden />,
    },
    {
      key: "phone",
      label: "Phone Verified",
      value: stats.phoneVerified,
      icon: <Phone className="h-4 w-4" aria-hidden />,
    },
    {
      key: "locPending",
      label: "Loc. Pending",
      value: stats.locPending,
      icon: <MapPin className="h-4 w-4" aria-hidden />,
    },
  ];

  return (
    <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <StatCard
          key={card.key}
          label={card.label}
          value={card.value}
          icon={card.icon}
          highlightValue={card.highlightValue}
          emphasize={card.emphasize}
          active={activeKey === card.key}
          onClick={onStatClick ? () => onStatClick(card.key) : undefined}
        />
      ))}
    </div>
  );
};
