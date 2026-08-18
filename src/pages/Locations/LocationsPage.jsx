// pages/locations/LocationsPage.jsx
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { INDIAN_STATES, getCitiesByState } from "../../utils/countryStateCity";

import useLocations from "./hooks/useLocations";
import {
  buildPayload,
  groupByState,
  getPopularCities,
} from "./utils/locationHelpers";

import LocationHeader from "./components/LocationHeader";
import LocationStats from "./components/LocationStats";
import LocationAccordion from "./components/LocationAccordion";
import LocationFormModal from "./components/LocationFormModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { getLocationListingCounts } from "../../features/property/propertyService";

export default function LocationsPage() {
  const {
    data,
    loading,
    errorMsg,
    successMsg,
    setSuccessMsg,
    setErrorMsg,
    saveLocation,
    deleteLocation,
    deleteLocality,
  } = useLocations();

  const { data: listingCounts } = useQuery({
    queryKey: ["location-listing-counts"],
    queryFn: async () => {
      const res = await getLocationListingCounts();
      return res?.data?.data || res?.data || null;
    },
    staleTime: 60_000,
  });

  const [openState, setOpenState] = useState(null);
  const [openCityId, setOpenCityId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const listRef = useRef(null);

  if (!data) return <LoadingSpinner />;

  const locations = data.locations || [];
  const groupedData = groupByState(locations);
  const popularCities = getPopularCities(locations);
  const indianStates = INDIAN_STATES;
  const getCities = getCitiesByState;

  const stateCount = Object.keys(groupedData).length;
  const cityCount = locations.length;
  const localityCount = locations.reduce(
    (sum, loc) => sum + (loc.localities?.length || 0),
    0,
  );

  const focusCity = (city) => {
    if (!city) return;
    setOpenState(city.state);
    setOpenCityId(city._id);
    // Scroll list into view after expand (mobile-friendly)
    requestAnimationFrame(() => {
      listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleAddNew = () => {
    setSuccessMsg("");
    setErrorMsg("");
    setEditItem(null);
    setShowAdd(true);
  };

  const handleAddLocalityToCity = (city) => {
    setSuccessMsg("");
    setErrorMsg("");
    setEditItem(city);
    setShowAdd(true);
  };

  const handleEditCity = (city) => {
    setSuccessMsg("");
    setErrorMsg("");
    setEditItem(city);
    setShowEdit(true);
  };

  const handleEditLocality = (city, locality) => {
    setSuccessMsg("");
    setErrorMsg("");
    setEditItem({ ...city, localities: [locality] });
    setShowEdit(true);
  };

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
      if (openCityId === deleteTarget.city._id) setOpenCityId(null);
    } else if (deleteTarget.type === "LOCALITY") {
      deleteLocality({
        locationId: deleteTarget.city._id,
        localityName: deleteTarget.locality.name,
      });
    }
  };

  const getDeleteTitle = () => {
    if (!deleteTarget) return "";
    if (deleteTarget.type === "CITY") {
      return `${deleteTarget.city.city}, ${deleteTarget.city.state}`;
    }
    return deleteTarget.locality?.name || "";
  };

  return (
    <div className="space-y-3">
      <LocationHeader onAdd={handleAddNew} />

      <LocationStats
        stateCount={stateCount}
        cityCount={cityCount}
        localityCount={localityCount}
        popularCities={popularCities}
        onSelectPopularCity={(city) => {
          const fullCity = locations.find(
            (l) => l.city === city.city && l.state === city.state,
          );
          if (fullCity) focusCity(fullCity);
        }}
        onEditPopularCity={(city) => {
          const fullCity = locations.find(
            (l) => l.city === city.city && l.state === city.state,
          );
          if (fullCity) handleEditCity(fullCity);
        }}
      />

      <div ref={listRef}>
        <LocationAccordion
          data={groupedData}
          listingCounts={listingCounts}
          openState={openState}
          setOpenState={(next) => {
            setOpenState(next);
            if (next !== openState) setOpenCityId(null);
          }}
          openCityId={openCityId}
          setOpenCityId={setOpenCityId}
          onEditCity={handleEditCity}
          onDeleteCity={handleDeleteCity}
          onAddLocality={handleAddLocalityToCity}
          onEditLocality={handleEditLocality}
          onDeleteLocality={handleDeleteLocality}
        />
      </div>

        {showAdd && (
          <LocationFormModal
            show={showAdd}
            title={
              editItem ? "Add Locality to City" : "Add New City & Locality"
            }
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
              setErrorMsg("");
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
              setErrorMsg("");
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

        {showDelete && (
          <DeleteConfirmModal
            show={showDelete}
            title={getDeleteTitle()}
            type={deleteTarget?.type}
            loading={loading}
            error={errorMsg}
            onClose={() => {
              setShowDelete(false);
              setDeleteTarget(null);
              setSuccessMsg("");
              setErrorMsg("");
            }}
            onConfirm={confirmDelete}
            success={successMsg}
            clearSuccess={() => setSuccessMsg("")}
          />
        )}
    </div>
  );
}
