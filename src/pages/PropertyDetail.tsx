import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import { mockProperties } from "@/data/mockProperties";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  Star,
  Heart,
  Share2,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

const PropertyDetail = () => {
  const { id } = useParams();
  const property = mockProperties.find((p) => p.id === id);

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex min-h-[60vh] flex-col items-center justify-center px-4">
          <h1 className="mb-4 text-3xl font-bold">Property Not Found</h1>
          <Button asChild>
            <Link to="/properties">Back to Properties</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleBooking = () => {
    toast.success("Booking request sent! The owner will contact you soon.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/properties">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Properties
          </Link>
        </Button>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-6 overflow-hidden rounded-2xl">
              <img
                src={property.image}
                alt={property.title}
                className="h-[500px] w-full object-cover"
              />
            </div>

            <div className="mb-8">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <h1 className="text-3xl font-bold text-foreground">{property.title}</h1>
                    {property.featured && (
                      <Badge className="bg-accent text-accent-foreground">Featured</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span className="text-lg">{property.location}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-accent text-accent" />
                      <span className="font-semibold">{property.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({property.reviews} reviews)
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="mb-6 flex items-center gap-6 rounded-xl border bg-muted/50 p-4">
                <div className="flex items-center gap-2">
                  <Bed className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{property.bedrooms} Bedrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{property.bathrooms} Bathrooms</span>
                </div>
                <div className="flex items-center gap-2">
                  <Maximize className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">{property.area}m²</span>
                </div>
                <Badge variant="secondary">{property.type}</Badge>
              </div>

              <div className="mb-8">
                <h2 className="mb-4 text-2xl font-bold text-foreground">Description</h2>
                <p className="leading-relaxed text-muted-foreground">{property.description}</p>
              </div>

              <div className="mb-8">
                <h2 className="mb-4 text-2xl font-bold text-foreground">Amenities</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {property.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="text-muted-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-lg">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="mb-2 flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-primary">
                      {property.price.toLocaleString()} EGP
                    </span>
                    <span className="text-muted-foreground">/night</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-semibold">{property.rating}</span>
                    <span className="text-muted-foreground">({property.reviews} reviews)</span>
                  </div>
                </div>

                <div className="mb-4 space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Check-in</label>
                    <input
                      type="date"
                      className="w-full rounded-lg border bg-background px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Check-out</label>
                    <input
                      type="date"
                      className="w-full rounded-lg border bg-background px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Guests</label>
                    <select className="w-full rounded-lg border bg-background px-3 py-2">
                      <option>1 Guest</option>
                      <option>2 Guests</option>
                      <option>3 Guests</option>
                      <option>4+ Guests</option>
                    </select>
                  </div>
                </div>

                <Button onClick={handleBooking} className="w-full" size="lg">
                  Request Booking
                </Button>

                <p className="mt-4 text-center text-sm text-muted-foreground">
                  You won't be charged yet
                </p>

                <div className="mt-6 space-y-2 border-t pt-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {property.price.toLocaleString()} EGP × 3 nights
                    </span>
                    <span className="font-medium">
                      {(property.price * 3).toLocaleString()} EGP
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee</span>
                    <span className="font-medium">500 EGP</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total</span>
                    <span>{(property.price * 3 + 500).toLocaleString()} EGP</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PropertyDetail;
