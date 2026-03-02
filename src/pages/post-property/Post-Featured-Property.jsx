 import { useState } from "react";
 

 export default function FeaturedPropertyEditorFullPage() {
   const [formData, setFormData] = useState({
     title: "Skyline Enclave amravathi",
     heroSubTagline: "Homes with soul,",
     heroDescription: "elevated by Design",
     priceLabel: "₹1.2Cr+",
     bhkSummary: [
       {
         bhk: 1,
         bhkLabel: "1 BHK",
         sqft: "1032 sqft",
         price: "1.23 Cr",
         details: "1 BHK Flat, 1585 sqft",
       },
       { bhk: 2, bhkLabel: "2 BHK", sqft: "1120 sqft", price: "95L - 1.1Cr" },
       {
         bhk: 3,
         bhkLabel: "3 BHK",
         sqft: "1265 sqft",
         price: "1.2Cr - 1.55Cr",
       },
     ],
     amenities: [
       "Fitness Center",
       "Garden",
       "Infinity Pool",
       "Club House",
       "24/7 Security",
       "Valet Parking",
       "High-Speed Wifi",
       "Power Backup",
       "Cafe Lounge",
       "Solar Power",
     ],
     gallery: [
       "/mnt/data/bf98abfc-ce7d-4f52-9923-315672d6c077.png",
       "/mnt/data/465def5b-010a-40f1-8911-b2f4e82521e1.png",
       "/mnt/data/7f69e93b-26c6-4df4-9965-c83a55c7701d.png",
       "/mnt/data/cde84f4d-9527-4ce5-b1f8-8e7970073565.png",
     ],
     specs: [
       {
         category: "Structure Work",
         items: [
           { title: "Walls", desc: "RCC structure" },
           { title: "Roofing", desc: "Concrete slab" },
         ],
       },
     ],
     nearbyPlaces: [
       { name: "HITEC CITY", distanceText: "15 Mins" },
       { name: "Gachibowli", distanceText: "10 Mins" },
       { name: "Wipro Circle", distanceText: "10 Mins" },
       { name: "Jubilee Hills", distanceText: "20 Mins" },
       { name: "Airport", distanceText: "25 Mins" },
     ],
     heroImage: "/mnt/data/5ebce2ba-eda8-417f-91e8-e03265e829de.png",
     floorplanImage: "/mnt/data/323db13c-9812-4c5b-b7c6-35a2b923cd5e.png",
     description:
       "Experience architectural excellence where modern luxury meets sustainable living. Your sanctuary above the ordinary awaits.",
   });

   const handleChange = (e) => {
     const { name, value } = e.target;
     setFormData((s) => ({ ...s, [name]: value }));
   };

   // Simple add amenity by Enter
   const addAmenity = (e) => {
     if (e.key === "Enter" && e.target.value.trim()) {
       setFormData((s) => ({
         ...s,
         amenities: [...s.amenities, e.target.value.trim()],
       }));
       e.target.value = "";
     }
   };

   return (
     <div className="min-h-screen bg-white text-gray-900">
       <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
         {/* LEFT: Editor - narrow column (admin controls) */}
         <aside className="lg:col-span-4 xl:col-span-3">
           <div className="sticky top-6 space-y-4">
             <div className="bg-white p-4 rounded-2xl shadow">
               <h2 className="text-lg font-semibold">Edit Featured Property</h2>
               <p className="text-sm text-gray-500">
                 Use the accordions to update the preview on the right.
               </p>

               <div className="mt-4 space-y-3">
                 <details
                   className="group border rounded-lg overflow-hidden"
                   open
                 >
                   <summary className="px-4 py-3 cursor-pointer flex items-center justify-between bg-white">
                     <div>
                       <div className="font-medium">Hero / Banner</div>
                       <div className="text-xs text-gray-500">
                         Top image, title and taglines
                       </div>
                     </div>
                     <div className="text-gray-400">▾</div>
                   </summary>
                   <div className="p-4 border-t space-y-2">
                     <input
                       name="title"
                       value={formData.title}
                       onChange={handleChange}
                       className="w-full p-2 border rounded"
                     />
                     <input
                       name="heroSubTagline"
                       value={formData.heroSubTagline}
                       onChange={handleChange}
                       className="w-full p-2 border rounded"
                     />
                     <input
                       name="heroDescription"
                       value={formData.heroDescription}
                       onChange={handleChange}
                       className="w-full p-2 border rounded"
                     />
                     <input
                       name="heroImage"
                       value={formData.heroImage}
                       onChange={handleChange}
                       className="w-full p-2 border rounded"
                     />
                   </div>
                 </details>

                 <details className="group border rounded-lg overflow-hidden">
                   <summary className="px-4 py-3 cursor-pointer flex items-center justify-between bg-white">
                     <div>
                       <div className="font-medium">
                         Available Properties (BHK)
                       </div>
                       <div className="text-xs text-gray-500">
                         Manage BHK tabs and values
                       </div>
                     </div>
                     <div className="text-gray-400">▾</div>
                   </summary>
                   <div className="p-4 border-t space-y-2">
                     {formData.bhkSummary.map((b, idx) => (
                       <div key={idx} className="p-3 border rounded">
                         <input
                           className="w-full p-2 mb-2 border rounded"
                           value={b.bhkLabel}
                           onChange={(e) => {
                             const val = e.target.value;
                             setFormData((s) => {
                               const arr = [...s.bhkSummary];
                               arr[idx].bhkLabel = val;
                               return { ...s, bhkSummary: arr };
                             });
                           }}
                         />
                         <div className="grid grid-cols-2 gap-2">
                           <input
                             className="p-2 border rounded"
                             value={b.sqft}
                             onChange={(e) => {
                               const val = e.target.value;
                               setFormData((s) => {
                                 const arr = [...s.bhkSummary];
                                 arr[idx].sqft = val;
                                 return { ...s, bhkSummary: arr };
                               });
                             }}
                           />
                           <input
                             className="p-2 border rounded"
                             value={b.price}
                             onChange={(e) => {
                               const val = e.target.value;
                               setFormData((s) => {
                                 const arr = [...s.bhkSummary];
                                 arr[idx].price = val;
                                 return { ...s, bhkSummary: arr };
                               });
                             }}
                           />
                         </div>
                       </div>
                     ))}
                   </div>
                 </details>

                 <details className="group border rounded-lg overflow-hidden">
                   <summary className="px-4 py-3 cursor-pointer flex items-center justify-between bg-white">
                     <div>
                       <div className="font-medium">Price & Description</div>
                       <div className="text-xs text-gray-500">
                         Price label and short summary
                       </div>
                     </div>
                     <div className="text-gray-400">▾</div>
                   </summary>
                   <div className="p-4 border-t space-y-2">
                     <input
                       className="w-full p-2 border rounded"
                       name="priceLabel"
                       value={formData.priceLabel}
                       onChange={handleChange}
                     />
                     <textarea
                       className="w-full p-2 border rounded"
                       name="description"
                       value={formData.description}
                       onChange={handleChange}
                       rows={3}
                     />
                   </div>
                 </details>

                 <details className="group border rounded-lg overflow-hidden">
                   <summary className="px-4 py-3 cursor-pointer flex items-center justify-between bg-white">
                     <div>
                       <div className="font-medium">Amenities</div>
                       <div className="text-xs text-gray-500">
                         Add new ones (press Enter)
                       </div>
                     </div>
                     <div className="text-gray-400">▾</div>
                   </summary>
                   <div className="p-4 border-t">
                     <div className="flex flex-wrap gap-2 mb-2">
                       {formData.amenities.map((a, i) => (
                         <div
                           key={i}
                           className="px-3 py-1 bg-yellow-50 rounded-full text-sm border"
                         >
                           {a}
                         </div>
                       ))}
                     </div>
                     <input
                       onKeyDown={addAmenity}
                       placeholder="Type amenity + Enter"
                       className="w-full p-2 border rounded"
                     />
                   </div>
                 </details>

                 <details className="group border rounded-lg overflow-hidden">
                   <summary className="px-4 py-3 cursor-pointer flex items-center justify-between bg-white">
                     <div>
                       <div className="font-medium">Gallery</div>
                       <div className="text-xs text-gray-500">
                         Add image URL for gallery
                       </div>
                     </div>
                     <div className="text-gray-400">▾</div>
                   </summary>
                   <div className="p-4 border-t space-y-2">
                     <div className="grid grid-cols-2 gap-2">
                       <input
                         id="galleryUrl2"
                         className="p-2 border rounded"
                         placeholder="Image URL"
                       />
                       <button
                         onClick={() => {
                           const el = document.getElementById("galleryUrl2");
                           if (el.value.trim())
                             setFormData((s) => ({
                               ...s,
                               gallery: [el.value.trim(), ...s.gallery],
                             }));
                           el.value = "";
                         }}
                         className="px-3 py-2 bg-orange-500 text-white rounded"
                       >
                         Add
                       </button>
                     </div>
                     <div className="grid grid-cols-3 gap-2 mt-2">
                       {formData.gallery.map((g, i) => (
                         <img
                           key={i}
                           src={g}
                           alt={`g${i}`}
                           className="w-full h-20 object-cover rounded"
                         />
                       ))}
                     </div>
                   </div>
                 </details>
               </div>
             </div>

             <div className="text-xs text-gray-500">
               Tip: This is a live edit preview. Replace local image paths with
               remote URLs for production.
             </div>
           </div>
         </aside>

         {/* RIGHT: Full-page Preview (matches Figma) */}
         <main className="lg:col-span-8 xl:col-span-9">
           {/* Hero */}
           <section className="relative h-[520px] rounded-2xl overflow-hidden shadow mb-6">
             <img
               src={formData.heroImage}
               alt="hero"
               className="w-full h-full object-cover brightness-90"
             />
             <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30" />

             <header className="absolute left-8 top-8 w-auto">
               <div className="text-white text-sm bg-white/10 px-3 py-1 rounded-full inline-block">
                 {formData.heroSubTagline}
               </div>
             </header>

             <div className="absolute left-8 bottom-28 text-white max-w-2xl">
               <h1 className="text-5xl font-extrabold leading-tight drop-shadow-md">
                 {formData.title.split(" ")[0]}{" "}
                 <span className="text-[#ff9900]">
                   {formData.title.split(" ").slice(1).join(" ")}
                 </span>
               </h1>
               <p className="mt-4 text-lg max-w-xl">
                 {formData.heroDescription}
               </p>
               <div className="mt-6 flex gap-3">
                 <button className="px-5 py-3 bg-white text-black rounded-full font-semibold">
                   Explore
                 </button>
                 <button className="px-5 py-3 bg-[#ff6600] text-white rounded-full font-semibold">
                   Explore
                 </button>
               </div>
             </div>

             {/* Enquiry card */}
             <div className="absolute right-8 top-14 bg-white/80 backdrop-blur-md p-5 rounded-xl w-72 border border-white/40">
               <div className="font-semibold text-gray-800">Enquiry Now</div>
               <input
                 className="w-full mt-3 p-2 border rounded bg-white"
                 placeholder="Your Name"
               />
               <input
                 className="w-full mt-2 p-2 border rounded bg-white"
                 placeholder="Your Mobile Number"
               />
               <input
                 className="w-full mt-2 p-2 border rounded bg-white"
                 placeholder="Your Email"
               />
               <textarea
                 className="w-full mt-2 p-2 border rounded bg-white"
                 rows={3}
                 placeholder="Message"
               />
               <button className="w-full mt-3 bg-[#ff6600] text-white py-2 rounded">
                 Submit
               </button>
             </div>

             {/* Hero Stats */}
             <div className="absolute left-8 bottom-6 right-8">
               <div className="grid grid-cols-4 gap-6 text-white">
                 <div>
                   <div className="text-2xl font-bold">
                     {formData.priceLabel}
                   </div>
                   <div className="text-xs opacity-80">Starting Price</div>
                 </div>
                 <div>
                   <div className="text-2xl font-bold">
                     {formData.bhkSummary.map((b) => b.bhkLabel).join(" / ")}
                   </div>
                   <div className="text-xs opacity-80">Configurations</div>
                 </div>
                 <div>
                   <div className="text-2xl font-bold">
                     {formData.amenities.length}+
                   </div>
                   <div className="text-xs opacity-80">Amenities</div>
                 </div>
                 <div>
                   <div className="text-2xl font-bold">RERA</div>
                   <div className="text-xs opacity-80">Approved</div>
                 </div>
               </div>
             </div>
           </section>

           {/* Available Properties / Floorplans */}
           <section className="bg-[#fffaf6] rounded-2xl p-6 mb-6">
             <div className="flex items-center justify-between">
               <div>
                 <h3 className="text-2xl font-semibold">
                   Available Properties
                 </h3>
                 <div className="text-sm text-gray-500">
                   Building excellence in Hyderabad
                 </div>
               </div>
               <div>
                 {/* Tabs */}
                 <div className="inline-flex bg-white rounded-full p-1 shadow">
                   {formData.bhkSummary.map((b, idx) => (
                     <button
                       key={idx}
                       className="px-4 py-2 text-sm rounded-full"
                     >
                       {b.bhkLabel}
                     </button>
                   ))}
                 </div>
               </div>
             </div>

             <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="col-span-2 bg-white p-6 rounded">
                 {/* Sizes row */}
                 <div className="flex gap-4 text-sm text-gray-600 mb-4 flex-wrap">
                   {formData.bhkSummary.map((b, i) => (
                     <div key={i} className="px-3 py-1 bg-white/30 rounded">
                       {b.sqft}
                     </div>
                   ))}
                 </div>

                 <div className="rounded overflow-hidden border">
                   <img
                     src={formData.floorplanImage}
                     alt="floorplan"
                     className="w-full object-contain"
                   />
                 </div>
               </div>

               <aside className="bg-white p-6 rounded">
                 <div className="text-right text-xl font-semibold">
                   {formData.bhkSummary[0].price}
                 </div>
                 <div className="mt-4 text-sm text-gray-600">
                   {formData.bhkSummary[0].details}
                 </div>
                 <ul className="mt-4 space-y-3 text-sm text-gray-700">
                   <li>2 Bathrooms</li>
                   <li>1 Balcony</li>
                   <li>Parking</li>
                   <li>Possession: Dec. 2025</li>
                 </ul>
                 <button className="mt-6 w-full bg-[#ff6600] text-white py-2 rounded">
                   Book a Consultation
                 </button>
               </aside>
             </div>
           </section>

           {/* Amenities */}
           <section className="mb-6">
             <h4 className="text-xl font-semibold mb-2">Amenities</h4>
             <div className="text-sm text-gray-500 mb-4">
               Building excellence in Hyderabad
             </div>
             <div className="flex flex-wrap gap-3">
               {formData.amenities.map((a, i) => (
                 <div
                   key={i}
                   className="px-4 py-2 rounded-full border bg-white text-sm"
                 >
                   {a}
                 </div>
               ))}
             </div>
           </section>

           {/* Locate Us */}
           <section className="mb-6">
             <h4 className="text-xl font-semibold mb-2">Locate Us</h4>
             <div className="text-sm text-gray-500 mb-4">
               Building excellence in Hyderabad
             </div>
             <div className="mb-3 flex gap-3 flex-wrap">
               {formData.nearbyPlaces.map((n, i) => (
                 <div
                   key={i}
                   className="text-sm px-3 py-2 bg-white rounded border"
                 >
                   {n.name}: {n.distanceText}
                 </div>
               ))}
             </div>
             <div className="rounded overflow-hidden h-56 mb-6">
               <img
                 src="/mnt/data/a40b979d-a711-441b-a2eb-65c54e1d18fc.png"
                 alt="map"
                 className="w-full h-full object-cover"
               />
             </div>
           </section>

           {/* Gallery */}
           <section className="mb-6">
             <h4 className="text-xl font-semibold mb-2">Gallery</h4>
             <div className="text-sm text-gray-500 mb-4">
               Building excellence in Hyderabad
             </div>
             <div className="grid grid-cols-12 gap-3">
               <div className="col-span-7 rounded overflow-hidden">
                 <img
                   src={formData.gallery[0]}
                   alt="g0"
                   className="w-full h-64 object-cover rounded"
                 />
               </div>
               <div className="col-span-5 grid grid-rows-2 gap-3">
                 <img
                   src={formData.gallery[1]}
                   alt="g1"
                   className="w-full h-32 object-cover rounded"
                 />
                 <div className="grid grid-cols-2 gap-3">
                   <img
                     src={formData.gallery[2]}
                     alt="g2"
                     className="w-full h-32 object-cover rounded col-span-1"
                   />
                   <img
                     src={formData.gallery[3]}
                     alt="g3"
                     className="w-full h-32 object-cover rounded col-span-1"
                   />
                 </div>
               </div>
             </div>
           </section>

           {/* About Us */}
           <section className="mb-6 bg-white p-6 rounded">
             <h4 className="text-xl font-semibold mb-2">About Us</h4>
             <div className="text-sm text-gray-700">
               Your home is a reflection of your personality and style. We take
               great pride in helping homeowners like you create the homes of
               their dreams. From architectural design to construction and
               finishing touches, we handle every aspect of residential projects
               with precision and care.
             </div>
             <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
               <img
                 src="/mnt/data/cde84f4d-9527-4ce5-b1f8-8e7970073565.png"
                 alt="about"
                 className="w-full h-40 object-cover rounded col-span-1 lg:col-span-1"
               />
               <ul className="col-span-2 list-disc pl-5 text-sm text-gray-700">
                 <li>20+ years of experience</li>
                 <li>End-to-End for All Your Commercial construction Needs</li>
                 <li>50+ residential and commercial projects in Hyderabad</li>
                 <li>Quality Check Mechanism</li>
                 <li>On time Delivery</li>
               </ul>
             </div>
           </section>

           {/* Projects carousel (simple) */}
           <section className="mb-12">
             <h4 className="text-xl font-semibold mb-2">
               Projects by Hallmark Skyrena
             </h4>
             <div className="text-sm text-gray-500 mb-4">
               Building excellence in Hyderabad
             </div>
             <div className="flex gap-4 overflow-x-auto py-3">
               {[1, 2, 3, 4, 5].map((i) => (
                 <div
                   key={i}
                   className="min-w-[240px] bg-white rounded-lg p-3 shadow-sm border"
                 >
                   <div className="h-36 bg-gray-200 rounded mb-2"></div>
                   <div className="text-sm font-medium">Hallmark Skyrena</div>
                   <div className="text-xs text-gray-500">₹ 9.35 - 11.6 Cr</div>
                 </div>
               ))}
             </div>
           </section>
         </main>
       </div>
     </div>
   );
 }
