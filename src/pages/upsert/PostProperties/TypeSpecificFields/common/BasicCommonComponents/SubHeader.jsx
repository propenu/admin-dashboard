import { Phone } from "lucide-react";

const SubHeader = () => {
    return (
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-xl font-semibold text-[#111111]">
          Add Basic Details
        </h2>

        <button type="button" className="flex items-center gap-1 text-sm">
          <span>Need help?</span>
          <Phone className="w-3.5 h-3.5 text-[#27AE60]" />
          <span className="font-semibold text-[#27AE60]">Get a callback</span>
        </button>
      </div>
    );
};

export default SubHeader