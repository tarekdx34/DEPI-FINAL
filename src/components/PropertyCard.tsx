import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, Bed, Bath, Maximize } from "lucide-react";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  image: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  type: string;
  featured?: boolean;
}

const PropertyCard = ({
  id,
  title,
  location,
  price,
  image,
  bedrooms,
  bathrooms,
  area,
  type,
  featured,
}: PropertyCardProps) => {
  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 bg-white/90 backdrop-blur-sm hover:bg-white"
        >
          <Heart className="h-5 w-5" />
        </Button>
        {featured && (
          <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">
            Featured
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground line-clamp-1">{title}</h3>
            <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          </div>
          <Badge variant="secondary">{type}</Badge>
        </div>

        <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="h-4 w-4" />
            <span>{area}m²</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t p-4">
        <div>
          <span className="text-2xl font-bold text-primary">
            {price.toLocaleString()} EGP
          </span>
          <span className="text-sm text-muted-foreground">/night</span>
        </div>
        <Button asChild size="sm">
          <Link to={`/properties/${id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
