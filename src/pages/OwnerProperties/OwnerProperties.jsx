 import { useQuery } from "@tanstack/react-query";
 import { Building2, Plus, MapPin } from "lucide-react";
 import { ownersProperties } from "../../services/propertyservice.jsx";
 import OwnerPropertyCard from "../OwnerProperties/OwnerPropertyCard.jsx";
 import LoadingSpinner from "../../components/common/LoadingSpinner.jsx";
 import { useNavigate } from "react-router-dom";

 export default function OwnerProperties() {
   const navigate = useNavigate();

   const { data, isLoading, isError } = useQuery({
     queryKey: ["ownersProperties"],
     queryFn: ownersProperties,
   });

   const properties = data?.items || [];
   const id = properties.length > 0 ? properties[0]._id : null;
   const stats = [
     {
       label: "Create Owner Property",
       icon: Plus,
       route: `/post-owner-property`,
       bg: "from-blue-50 to-blue-100",
       textColor: "text-blue-600",
     },
     {
       label: "Active Properties",
       icon: Building2,
       value: properties.length,
       bg: "from-green-50 to-green-100",
       textColor: "text-green-600",
     },
     {
       label: "Not Verified Properties",
       icon: Building2,
       value: properties.filter((x) => !x.ownerProperties?.isVerified).length,
       bg: "from-purple-50 to-purple-100",
       textColor: "text-purple-600",
     },
     {
       label: "Total Locations",
       icon: MapPin,
       value: properties.length,
       bg: "from-orange-50 to-orange-100",
       textColor: "text-orange-600",
     },
   ];

   return (
     <div className="space-y-6">
       {/* Header */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
         <div>
           <h1 className="text-3xl font-bold text-slate-900">
             Owner Properties Overview
           </h1>
           <p className="text-slate-600 mt-1">
             Welcome back! Here's what's happening today.
           </p>
         </div>

         <div className="p-6 flex flex-col text-center">
           <h2 className="text-xl text-green-800 font-semibold">
             {properties.length}
           </h2>
           <p className="text-slate-500">Total Properties</p>
         </div>
       </div>

       {/* Stats */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
         {stats.map((stat, index) => {
           const Icon = stat.icon;
           return (
             <div
               key={index}
               onClick={() => stat.route && navigate(stat.route)}
               className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition cursor-pointer border border-gray-200"
             >
               <div className="flex items-center justify-between mb-4">
                 <div
                   className={`w-12 h-12 bg-gradient-to-br ${stat.bg} rounded-lg flex items-center justify-center`}
                 >
                   <Icon className={`w-6 h-6 ${stat.textColor}`} />
                 </div>
               </div>
               <p className="text-slate-600">{stat.label}</p>
               {stat.value !== undefined && (
                 <p className="text-2xl font-bold text-slate-900 mt-1">
                   {stat.value}
                 </p>
               )}
             </div>
           );
         })}
       </div>

       {/* Property Grid */}
       <div>
         <h2 className="text-xl font-bold text-slate-900 mb-4">
           Recent Owner Properties
         </h2>

         {isLoading ? (
           <LoadingSpinner />
         ) : isError ? (
           <div className="text-center py-12 text-slate-600">
             Failed to load properties.
           </div>
         ) : (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
             {properties.slice(0, 6).map((property) => (
               <OwnerPropertyCard key={property._id} property={property} />
             ))}
           </div>
         )}
       </div>
     </div>
   );
 }
