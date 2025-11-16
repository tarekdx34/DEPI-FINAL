import { ImageWithFallback } from "../../figma/ImageWithFallback";
import { PopularLocation } from "../../../../api";
import { Language } from "../../../lib/translations";

interface PopularLocationsProps {
  t: any;
  language: Language;
  locations: PopularLocation[];
  loading: boolean;
  onNavigate: (page: string) => void;
}

export function PopularLocations({
  t,
  language,
  locations,
  loading,
  onNavigate,
}: PopularLocationsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {locations.map((location) => (
        <button
          key={`${location.governorate}-${location.city}`}
          onClick={() => onNavigate("properties")}
          className="group relative overflow-hidden rounded-2xl h-64 hover:shadow-xl transition-shadow"
        >
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1593663094448-9ea85c6e8456?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            alt={location.city}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div
            className={`absolute bottom-6 ${
              language === "ar" ? "right-6" : "left-6"
            } text-white`}
          >
            <h3 className="text-2xl font-semibold mb-1">{location.city}</h3>
            <p className="text-sm text-white/90">
              {location.propertyCount}{" "}
              {language === "ar" ? "عقار" : "properties"}
            </p>
            <p className="text-xs text-white/80 mt-1">
              {language === "ar" ? "من" : "From"} {location.minPrice} EGP
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
