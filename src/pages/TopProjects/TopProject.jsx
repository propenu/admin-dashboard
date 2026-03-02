 

//D:\propenu\frontend\admin-dashboard\src\pages\TopProject.jsx

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Building2,
  Plus,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { topProject } from "../../services/propertyservice";
import TopProjectCard from "../TopProjects/TopProjectCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useNavigate } from "react-router-dom";


export default function TopProject() {
  const navigate = useNavigate();
  const [openLocations, setOpenLocations] = useState(false);

  // Fetch Top Properties
  const { data, isLoading, isError } = useQuery({
    queryKey: ["topProject"],
    queryFn: topProject,
  });

  const properties = data?.items || [];
  const id = properties.length > 0 ? properties[0]._id : null;
  // Extract unique city names
  const uniqueLocations = [
    ...new Set(properties.map((p) => p.city).filter(Boolean)),
  ];

  const stats = [
    {
      label: "Create Featured Property",
      icon: Plus,
      value: "",
      route: `/post-top-project/${id}`,
      bg: "from-blue-50 to-blue-100",
      textColor: "text-blue-600",
    },
    {
      label: "Active Top Properties",
      icon: Building2,
      value: properties.filter((p) => p.status === "active").length || 0,
      route: "/",
      bg: "from-green-50 to-green-100",
      textColor: "text-green-600",
    },
    {
      label: "Deactivated Properties",
      icon: Building2,
      value: properties.filter((p) => p.status === "inactive").length || 0,
      bg: "from-purple-50 to-purple-100",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Top Properties Overview
          </h1>
          <p className="text-slate-600 mt-1">
            Explore your top-performing properties.
          </p>
        </div>

        <div className="p-6 flex flex-col text-center">
          <h2 className="text-xl text-green-800 font-bold">
            {properties.length}
          </h2>
          <p className="text-slate-500 text-sm">Total Properties</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Normal Stat Boxes */}
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              onClick={() => stat.route && navigate(stat.route)}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition border cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>

               <p className="text-slate-600 text-sm">{stat.label}</p>
              {stat.value !== "" && (
                <p className="text-2xl font-bold text-slate-900 mt-2">
                  {stat.value}
                </p>
              )}
            </div>
          );
        })}

        {/* LOCATION DROPDOWN */}
        <div className="bg-white rounded-xl p-6 shadow-md border">
          {/* Header */}
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setOpenLocations(!openLocations)}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <p className="text-slate-700 font-medium text-lg">Location</p>
            </div>

            {openLocations ? (
              <ChevronUp className="w-5 h-5 text-slate-800" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-800" />
            )}
          </div>

          {/* Dropdown Content */}
          {openLocations && (
            <div className="mt-4 space-y-2">
              {uniqueLocations.length > 0 ? (
                uniqueLocations.map((loc, i) => (
                  <p
                    key={i}
                    className="text-slate-600 text-sm py-1 border-b last:border-none"
                  >
                    {loc}
                  </p>
                ))
              ) : (
                <p className="text-slate-500 text-sm">No locations found</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top Properties List */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Top Properties
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner size="lg" />
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-red-500">
            Failed to load top properties.
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 text-slate-600">
            No properties found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((p) => (
              <TopProjectCard key={p._id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
