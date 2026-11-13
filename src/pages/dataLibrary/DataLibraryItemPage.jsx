import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import DataTableView from "./components/DataTableView";
import { useDataLibraryItem } from "./hooks/useDataLibrary";

export default function DataLibraryItemPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { data: item, isLoading, isError } = useDataLibraryItem(id);
  const view = searchParams.get("view") === "document" ? "document" : "table";

  if (isLoading) {
    return <div className="p-8 text-sm text-gray-500">Loading…</div>;
  }
  if (isError || !item) {
    return (
      <div className="p-8 text-sm text-gray-500">
        This document could not be opened.{" "}
        <button type="button" className="font-semibold text-emerald-700" onClick={() => navigate("/data-library")}>
          Back to Data Library
        </button>
      </div>
    );
  }

  return <DataTableView asPage item={item} view={view} onClose={() => navigate("/data-library")} />;
}
