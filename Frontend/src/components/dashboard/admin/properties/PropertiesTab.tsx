// src/components/dashboard/admin/properties/PropertiesTab.tsx
import { SearchBar } from "../shared/SearchBar";
import { PropertyGrid } from "./PropertyGrid";
import { Language, translations } from "../../../../lib/translations";
import type { PropertyResponse } from "../../../../../api";

interface PropertiesTabProps {
  properties: PropertyResponse[];
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string | boolean) => string;
  onDelete: (type: string, id: number, name: string) => void;
  language: Language;
}

export function PropertiesTab({
  properties,
  formatCurrency,
  getStatusColor,
  onDelete,
  language,
}: PropertiesTabProps) {
  const t = translations[language];

  return (
    <div className="space-y-6" dir={language === "ar" ? "rtl" : "ltr"}>
      <div
        className={`flex items-center justify-between mb-6 ${
          language === "ar" ? "flex-row-reverse" : ""
        }`}
      >
        <h2
          className={`text-2xl font-semibold text-[#2B2B2B] ${
            language === "ar" ? "text-right" : ""
          }`}
        >
          {t.admin?.manageProperties || "Manage Properties"} (
          {properties.length})
        </h2>
        <SearchBar
          placeholder={t.admin?.searchProperties || "Search properties..."}
        />
      </div>

      <PropertyGrid
        properties={properties}
        formatCurrency={formatCurrency}
        getStatusColor={getStatusColor}
        onDelete={onDelete}
        language={language}
      />
    </div>
  );
}
