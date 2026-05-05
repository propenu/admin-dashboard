// src/features/property/pages/FeaturedProjects/FeaturedProjectsPage.jsx
import { useFeaturedProjects } from "../../hooks/useFeaturedProjects";
import PropertyListPage from "../../components/shared/PropertyListPage";

export default function FeaturedProjectsPage() {
  const hook = useFeaturedProjects("featured");

  return (
    <PropertyListPage
      type="featured"
      title="Top Selling Projects"
      subtitle="Highlighted properties displayed in featured sections."
      createRoute="/create-featured-project"
      accentColor="text-[#27AE60]"
      hook={hook}
    />
  );
}
