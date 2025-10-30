import { Heart, Star } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  onSelect?: (id: string) => void;
  isFavourite?: boolean;
  onToggleFavourite?: (property: any) => void;
}
export function PropertyCard({
  id,
  image,
  title,
  location,
  rating,
  reviews,
  price,
  onSelect,
  isFavourite = false,
  onToggleFavourite,
}: PropertyCardProps) {
  // Ensure we have valid data with fallbacks
  const displayImage =
    image ||
    "https://images.unsplash.com/photo-1729720281771-b790dfb6ec7f?w=400";
  const displayTitle = title || "Property";
  const displayLocation = location || "Egypt";
  const displayRating = rating || 0;
  const displayReviews = reviews || 0;
  const displayPrice = price || 0;

  return (
    <div
      className="group cursor-pointer"
      onClick={() => onSelect && onSelect(id)}
    >
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-3">
        <ImageWithFallback
          src={displayImage}
          alt={displayTitle}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleFavourite) {
              onToggleFavourite({
                id,
                image: displayImage,
                title: displayTitle,
                location: displayLocation,
                rating: displayRating,
                reviews: displayReviews,
                price: displayPrice,
              });
            }
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavourite ? "fill-[#FF6B6B] text-[#FF6B6B]" : "text-gray-700"
            }`}
          />
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-[#2B2B2B] line-clamp-1">
            {displayTitle}
          </h3>
          {displayRating > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-4 h-4 fill-[#2B2B2B] text-[#2B2B2B]" />
              <span className="text-sm">{displayRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600">{displayLocation}</p>
        {displayReviews > 0 && (
          <p className="text-sm text-gray-500">
            {displayReviews} {displayReviews === 1 ? "review" : "reviews"}
          </p>
        )}
        <div className="pt-1">
          <span className="font-semibold text-[#2B2B2B]">
            {displayPrice.toLocaleString("en-US", { maximumFractionDigits: 0 })}{" "}
            EGP
          </span>
          <span className="text-gray-600"> / night</span>
        </div>
      </div>
    </div>
  );
}
