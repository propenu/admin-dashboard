
// frontend/admin-dashboard/src/pages/Residential/PostResidentailProperty/TypeSpecificFields/common/BasicCommonComponents/TopHeader.jsx
const TopHeader = () => {
    return (
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#27AE60] text-white font-bold">
            F
          </div>
          <div className="flex relative right-3 items-center justify-center w-9 h-9 rounded-full bg-[#9747FF] text-white font-bold">
            A
          </div>
        </div>
        <p className="text-sm text-[#111111]">
          <span className="font-semibold">GET 2 extra enquiries</span> if you
          list your property in
          <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded-full">
            5:35
          </span>
        </p>
      </div>
    );
};

export default TopHeader;