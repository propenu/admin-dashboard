import { StatCard } from "./ReusableComaponents"
import { CheckCircle2, MapPin, Phone, ShieldCheck, UsersIcon } from "lucide-react"

export const StatCards = ({ stats }) => {

return (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
    <StatCard
      label="Total Users"
      value={stats.total}
      icon={<UsersIcon className="w-5 h-5 text-[#27AE60]" />}
      colorClass="bg-[#27AE60]/10"
    />
    <StatCard
      label="Active"
      value={stats.active}
      icon={<CheckCircle2 className="w-5 h-5 text-[#27AE60]" />}
      colorClass="bg-[#27AE60]/10"
    />
    <StatCard
      label="KYC Verified"
      value={stats.kycVerified}
      icon={<ShieldCheck className="w-5 h-5 text-blue-500" />}
      colorClass="bg-blue-50"
    />
    <StatCard
      label="Phone Verified"
      value={stats.phoneVerified}
      icon={<Phone className="w-5 h-5 text-purple-500" />}
      colorClass="bg-purple-50"
    />
    <StatCard
      label="Loc. Pending"
      value={stats.locPending}
      icon={<MapPin className="w-5 h-5 text-amber-500" />}
      colorClass="bg-amber-50"
    />
  </div>
)
}