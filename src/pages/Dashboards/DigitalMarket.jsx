//src/pages/Dashboards/DigitalMarket.jsx
import React from "react";
import { BarChart3, Clock3 } from "lucide-react";

const DigitalMarket = () => {
  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-10 max-w-xl w-full text-center border border-gray-200">

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-5 rounded-full">
            <BarChart3 className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800">
          Digital Marketing Analytics
        </h1>

        {/* Status */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <Clock3 className="w-5 h-5 text-amber-500" />
          <span className="text-amber-600 font-semibold">
            Module Under Development
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 mt-6 leading-7">
          The Digital Marketing Analytics dashboard is currently under
          development and will be available in an upcoming release.
        </p>

        <p className="text-gray-500 mt-3">
          This module will provide comprehensive insights into marketing
          performance, campaign analytics, lead generation, customer
          engagement, conversion metrics, and ROI tracking.
        </p>

        {/* Footer */}
        <div className="mt-8 pt-5 border-t text-sm text-gray-400">
          Thank you for your patience while we continue enhancing the platform.
        </div>

      </div>
    </div>
  );
};

export default DigitalMarket;