// src/components/dashboard/renter/favorites/FavoritesTab.tsx
import { useState, useEffect } from "react";
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { ImageWithFallback } from "../../../figma/ImageWithFallback";
import { EmptyState } from "../../shared/components/EmptyState";
import api, { FavoriteResponse } from "../../../../../api";
import { Heart, MapPin, Loader2, Star } from "lucide-react";
import { toast } from "sonner";

interface FavoritesTabProps {
  onNavigate: (page: string, id?: string) => void;
}

export function FavoritesTab({ onNavigate }: FavoritesTabProps) {
  const [favorites, setFavorites] = useState<FavoriteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.getFavorites({ page: 0, size: 100 });
      setFavorites(response?.content || []);
    } catch (err) {
      console.error('Error fetching favorites:', err);
      toast.error('Failed to load favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (propertyId: number) => {
    try {
      setRemovingId(propertyId);
      await api.removeFavorite(propertyId);
      setFavorites(favorites.filter(f => f.property.propertyId !== propertyId));
      toast.success('Removed from favorites');
    } catch (err) {
      console.error('Error removing favorite:', err);
      toast.error('Failed to remove favorite');
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#00BFA6] animate-spin" />
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="No favorites yet"
        description="Save properties you love to easily find them later"
        actionLabel="Browse Properties"
        onAction={() => onNavigate('properties')}
      />
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">
        My Favorites ({favorites.length})
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((favorite) => (
          <Card
            key={favorite.favoriteId}
            className="overflow-hidden group cursor-pointer hover:shadow-lg transition-all"
          >
            <div 
              className="relative aspect-[4/3] overflow-hidden"
              onClick={() => onNavigate('property-details', String(favorite.property.propertyId))}
            >
              <ImageWithFallback
                src={favorite.property.coverImage || `/api/properties/${favorite.property.propertyId}/cover`}
                alt={favorite.property.titleEn || favorite.property.titleAr || 'Property'}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleRemoveFavorite(favorite.property.propertyId);
                }}
                disabled={removingId === favorite.property.propertyId}
              >
                {removingId === favorite.property.propertyId ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                ) : (
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                )}
              </Button>

              {favorite.property.isFeatured && (
                <Badge className="absolute top-2 left-2 bg-[#FFB74D] text-white">
                  Featured
                </Badge>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-[#2B2B2B] mb-1 truncate">
                {favorite.property.titleEn || favorite.property.titleAr || 'Unknown Property'}
              </h3>
              
              <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                <MapPin className="w-3 h-3" />
                <span className="truncate">
                  {favorite.property.city || 'Unknown'}, {favorite.property.governorate || 'Unknown'}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-[#2B2B2B]">
                    {favorite.property.pricePerNight?.toLocaleString() || '0'} EGP
                  </span>
                  <span className="text-sm text-gray-600"> / night</span>
                </div>
                
                {favorite.property.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {favorite.property.averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-600">
                      ({favorite.property.totalReviews || 0})
                    </span>
                  </div>
                )}
              </div>

              {favorite.notes && (
                <p className="text-xs text-gray-500 mt-2 italic truncate">
                  "{favorite.notes}"
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}