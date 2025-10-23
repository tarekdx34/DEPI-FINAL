import { Heart, Star } from "lucide-react";
import { useState } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { Property } from "../App";

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
  onToggleFavourite?: (property: Property) => void;
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
  const [isFavorite, setIsFavorite] = useState(isFavourite);

  return (
    <div
      className="group cursor-pointer"
      onClick={() => onSelect && onSelect(id)}
    >
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-3">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleFavourite) {
              onToggleFavourite({ id, image, title, location, rating, reviews, price });
            }
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
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
          <h3 className="font-semibold text-[#2B2B2B] line-clamp-1">{title}</h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-4 h-4 fill-[#2B2B2B] text-[#2B2B2B]" />
            <span className="text-sm">{rating}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600">{location}</p>
        <p className="text-sm text-gray-500">{reviews} reviews</p>
        <div className="pt-1">
          <span className="font-semibold text-[#2B2B2B]">{price} EGP</span>
          <span className="text-gray-600"> / night</span>
        </div>
      </div>
    </div>
  );
}