// src/features/property/pages/NormalProjects/NormalProjectsPage.jsx
import { useFeaturedProjects } from "../../hooks/useFeaturedProjects";
import PropertyListPage from "../../components/shared/PropertyListPage";

export default function NormalProjectsPage() {
  const hook = useFeaturedProjects("normal");

  return (
    <PropertyListPage
      type="normal"
      title="Normal Projects"
      subtitle="Standard property listings without promotion."
      createRoute="/create-featured-project"
      accentColor="text-[#27AE60]"
      hook={hook}
    />
  );
}
