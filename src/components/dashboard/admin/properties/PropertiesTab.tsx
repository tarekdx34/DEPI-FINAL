// src/components/dashboard/admin/properties/PropertiesTab.tsx
import { SearchBar } from "../shared/SearchBar";
import { PropertyGrid } from "./PropertyGrid";
import type { PropertyResponse } from "../../../../api";

interface PropertiesTabProps {
  properties: PropertyResponse[];
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string | boolean) => string;
  onDelete: (id: number, title: string) => void;
}

export function PropertiesTab({
  properties,
  formatCurrency,
  getStatusColor,
  onDelete,
}: PropertiesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-[#2B2B2B]">
          Manage Properties ({properties.length})
        </h2>
        <SearchBar placeholder="Search properties..." />
      </div>

      <PropertyGrid
        properties={properties}
        formatCurrency={formatCurrency}
        getStatusColor={getStatusColor}
        onDelete={onDelete}
      />
    </div>
  );
}
