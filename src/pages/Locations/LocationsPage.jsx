// pages/locations/LocationsPage.jsx
import { useState } from "react";
import { State, City } from "country-state-city";

import useLocations from "./hooks/useLocations";
import { buildPayload, groupByState, getPopularCities } from "./utils/locationHelpers";

import LocationHeader from "./components/LocationHeader";
import LocationStats from "./components/LocationStats";
import LocationAccordion from "./components/LocationAccordion";
import LocationDetailCard from "./components/LocationDetailCard";
import LocationFormModal from "./components/LocationFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function LocationsPage() {
  const {
    data,
    loading,
    errorMsg,
    successMsg,
    setSuccessMsg,
    saveLocation,
    deleteLocation,
    deleteLocality,
  } = useLocations();

  console.log("DEBUG: LocationsPage Rendered", { data });

  const [selectedLoc, setSelectedLoc] = useState(null);
  const [openState, setOpenState] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'CITY' | 'LOCALITY', city, locality? }

  if (!data) return <LoadingSpinner />;

  const locations = data.locations || [];
  const groupedData = groupByState(locations);
  const popularCities = getPopularCities(locations);
  const indianStates = State.getStatesOfCountry("IN");

  const getCities = (stateName) => {
    const st = indianStates.find((s) => s.name === stateName);
    return st ? City.getCitiesOfState("IN", st.isoCode) : [];
  };

  // ADD HANDLERS
  const handleAddNew = () => {
    setSuccessMsg("");
    setEditItem(null);
    setShowAdd(true);
  };

  const handleAddLocalityToCity = (city) => {
    setSuccessMsg("");
    setEditItem(city);
    setShowAdd(true);
  };

  // EDIT HANDLERS
  const handleEditCity = (city) => {
    setSuccessMsg("");
    setEditItem(city);
    setShowEdit(true);
  };

  const handleEditLocality = (city, locality) => {
    setSuccessMsg("");
    setEditItem({ ...city, localities: [locality] });
    setShowEdit(true);
  };

  // DELETE HANDLERS
  const handleDeleteCity = (city) => {
    setSuccessMsg("");
    setDeleteTarget({ type: "CITY", city });
    setShowDelete(true);
  };

  const handleDeleteLocality = (city, locality) => {
    setSuccessMsg("");
    setDeleteTarget({ type: "LOCALITY", city, locality });
    setShowDelete(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "CITY") {
      deleteLocation(deleteTarget.city._id);
    } else if (deleteTarget.type === "LOCALITY") {
      deleteLocality({
        locationId: deleteTarget.city._id,
        localityName: deleteTarget.locality.name,
      });
    }

    setSelectedLoc(null);
  };

  const getDeleteTitle = () => {
    if (!deleteTarget) return "";
    if (deleteTarget.type === "CITY") {
      return `${deleteTarget.city.city}, ${deleteTarget.city.state}`;
    }
    return deleteTarget.locality?.name || "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <LocationHeader onAdd={handleAddNew} />
        
        {/* STATS */}
        <LocationStats total={locations.length} popularCities={popularCities} />

        {/* SELECTED DETAILS */}
        {selectedLoc && (
          <LocationDetailCard
            data={selectedLoc}
            onClose={() => setSelectedLoc(null)}
            onEditCity={handleEditCity}
            onEditLocality={(locality) => handleEditLocality(selectedLoc, locality)}
            onDeleteCity={() => handleDeleteCity(selectedLoc)}
            onDeleteLocality={(locality) => handleDeleteLocality(selectedLoc, locality)}
          />
        )}

        {/* ACCORDION */}
        <LocationAccordion
          data={groupedData}
          openState={openState}
          setOpenState={setOpenState}
          selectedLoc={selectedLoc}
          onSelectCity={setSelectedLoc}
          onEditCity={handleEditCity}
          onDeleteCity={handleDeleteCity}
          onAddLocality={handleAddLocalityToCity}
          onEditLocality={handleEditLocality}
          onDeleteLocality={handleDeleteLocality}
        />

        {/* ADD MODAL */}
        {showAdd && (
          <LocationFormModal
            show={showAdd}
            title={editItem ? "Add Locality to City" : "Add New City & Locality"}
            initialData={editItem}
            states={indianStates}
            getCities={getCities}
            loading={loading}
            error={errorMsg}
            success={successMsg}
            onClose={() => {
              setShowAdd(false);
              setEditItem(null);
              setSuccessMsg("");
            }}
            onSubmit={(form) =>
              saveLocation({
                payload: buildPayload(form),
                mode: "ADD",
              })
            }
            clearSuccess={() => setSuccessMsg("")}
          />
        )}

        {/* EDIT MODAL */}
        {showEdit && (
          <LocationFormModal
            show={showEdit}
            title="Edit Location"
            initialData={editItem}
            states={indianStates}
            getCities={getCities}
            loading={loading}
            error={errorMsg}
            success={successMsg}
            onClose={() => {
              setShowEdit(false);
              setEditItem(null);
              setSuccessMsg("");
            }}
            onSubmit={(form) =>
              saveLocation({
                payload: buildPayload(form),
                mode: "EDIT",
                id: editItem?._id,
              })
            }
            clearSuccess={() => setSuccessMsg("")}
          />
        )}

        {/* DELETE MODAL */}
        {showDelete && (
          <DeleteConfirmModal
            show={showDelete}
            title={getDeleteTitle()}
            type={deleteTarget?.type}
            loading={loading}
            onClose={() => {
              setShowDelete(false);
              setDeleteTarget(null);
              setSuccessMsg("");
            }}
            onConfirm={confirmDelete}
            success={successMsg}
            clearSuccess={() => setSuccessMsg("")}
          />
        )}
      </div>
    </div>
  );
}