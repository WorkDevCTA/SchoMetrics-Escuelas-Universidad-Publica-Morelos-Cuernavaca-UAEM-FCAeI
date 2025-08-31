import React from "react";
import ResourceCard from "./ResourceCard";
import type { DirectorySection } from "../data";

interface ResourceSectionProps {
  section: DirectorySection;
  cardType?: "organization" | "media" | "website";
}

const ResourceSection: React.FC<ResourceSectionProps> = ({
  section,
  cardType,
}) => {
  const SectionIcon = section.icon;

  return (
    <div className="mb-10">
      <div className="mb-5 flex items-center gap-3">
        {SectionIcon && <SectionIcon className="h-8 w-8 text-orange-700" />}
        <h2 className="text-2xl font-semibold text-gray-800">
          {section.title}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {section.resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} type={cardType} />
        ))}
      </div>
    </div>
  );
};

export default ResourceSection;
