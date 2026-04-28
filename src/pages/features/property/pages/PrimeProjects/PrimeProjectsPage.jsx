// src/features/property/pages/PrimeProjects/PrimeProjectsPage.jsx
import { useFeaturedProjects } from "../../hooks/useFeaturedProjects";
import PropertyListPage from "../../components/shared/PropertyListPage";

export default function PrimeProjectsPage() {
  const hook = useFeaturedProjects("prime");

  return (
    <PropertyListPage
      type="prime"
      title="Prime Projects"
      subtitle="Top-tier featured properties with maximum visibility."
      createRoute="/create-featured-project"
      accentColor="text-[#27AE60]"
      hook={hook}
    />
  );
}
