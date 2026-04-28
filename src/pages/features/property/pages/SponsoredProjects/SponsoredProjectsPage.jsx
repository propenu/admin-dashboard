// src/features/property/pages/SponsoredProjects/SponsoredProjectsPage.jsx
import { useFeaturedProjects } from "../../hooks/useFeaturedProjects";
import PropertyListPage from "../../components/shared/PropertyListPage";

export default function SponsoredProjectsPage() {
  const hook = useFeaturedProjects("sponsored");

  return (
    <PropertyListPage
      type="sponsored"
      title="Sponsored Projects"
      subtitle="Paid sponsored listings with premium placement."
      createRoute="/create-featured-project"
      accentColor="text-[#27AE60]"
      hook={hook}
    />
  );
}
