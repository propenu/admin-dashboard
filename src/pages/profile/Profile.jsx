import { useEffect, useState } from "react";
import { fetchMe } from "../../services/UserServices/userServices";
import LoadingSpinner from '../../components/common/LoadingSpinner'
import {
  User,
  Mail,
  Shield,
  Key,
  ChevronRight,
  Settings,
  Crown,
  Phone,
} from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchMe(); // returns { message, token, user }
        setUser(data.user);
      } catch (err) {
        console.error("Profile load failed", err);
      }
    }
    loadProfile();
  }, []);

  if (!user)
    return <LoadingSpinner />;

  return (
    <div className="p-6 animate-fadeIn">
      <h1 className="text-3xl font-bold text-[#27AE60] mb-6">My Profile</h1>

      {/* PROFILE CARD */}
      <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl p-6 border border-slate-100">
        {/* TOP SECTION */}
        <div className="flex items-center gap-6 mb-6">
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full bg-gradient-to-br 
              from-green-500 to-green-700 flex items-center justify-center shadow-lg"
          >
            <User className="w-10 h-10 text-white" />
          </div>

          {/* User Info */}
          <div>
            <h2 className="text-2xl font-bold text-[#3cab6a] capitalize">
              {user.name}
            </h2>
            <p className="text-sm text-slate-500 capitalize">{user.roleName}</p>
          </div>
        </div>

        {/* DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailBox
            icon={<Mail className="w-5 h-5 text-blue-600" />}
            title="Email"
            value={user.email}
          />
          <DetailBox
            icon={<Phone className="w-5 h-5 text-blue-600" />}
            title="phone"
            value={user.phone}
          />

          <DetailBox
            icon={<Shield className="w-5 h-5 text-purple-600" />}
            title="Role Name"
            value={user.roleName}
          />

          <DetailBox
            icon={<Key className="w-5 h-5 text-red-600" />}
            title="Role ID"
            value={user.roleId}
          />

          <DetailBox
            icon={<Crown className="w-5 h-5 text-orange-600" />}
            title="User ID"
            value={user.id}
          />
        </div>

        {/* PERMISSIONS */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Permissions
          </h3>

          <div className="flex flex-wrap gap-2">
            {user.permissions?.map((permission, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full"
              >
                {permission}
              </span>
            ))}
          </div>
        </div>

        {/* BUTTON */}
        <button
          className="mt-8 flex items-center gap-2 px-5 py-3 bg-gradient-to-r 
          from-blue-600 to-blue-700 text-white rounded-xl shadow-lg 
          hover:shadow-xl hover:opacity-90 transition-all"
        >
          <Settings className="w-5 h-5" />
          Edit Profile
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

/* COMPONENT FOR REUSABLE DETAIL BOX */
function DetailBox({ icon, title, value }) {
  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-1">
        {icon}
        <span className="text-sm font-semibold text-slate-600">{title}</span>
      </div>
      <p className="text-slate-800 font-medium">{value}</p>
    </div>
  );
}
