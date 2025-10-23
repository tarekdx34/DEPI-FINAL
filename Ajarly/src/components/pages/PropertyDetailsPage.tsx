import { useState } from "react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  Star,
  MapPin,
  Wifi,
  Car,
  Utensils,
  Wind,
  Tv,
  Waves,
  Shield,
  Award,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";

interface PropertyDetailsPageProps {
  propertyId?: string;
  onNavigate: (page: string) => void;
}

export function PropertyDetailsPage({
  propertyId,
  onNavigate,
}: PropertyDetailsPageProps) {
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState("");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const property = {
    title: "Luxury Beachfront Villa with Private Pool",
    location: "North Coast, Egypt",
    rating: 4.9,
    reviews: 128,
    price: 3500,
    host: {
      name: "Ahmed Hassan",
      avatar: "",
      verified: true,
      yearsHosting: 5,
    },
    amenities: [
      { icon: Wifi, label: "Free WiFi" },
      { icon: Car, label: "Free Parking" },
      { icon: Utensils, label: "Full Kitchen" },
      { icon: Wind, label: "Air Conditioning" },
      { icon: Tv, label: "Smart TV" },
      { icon: Waves, label: "Private Beach Access" },
    ],
    description:
      "Experience luxury living in this stunning beachfront villa on Egypt's beautiful North Coast. With breathtaking Mediterranean views, a private pool, and direct beach access, this property offers the perfect escape for families and groups seeking an unforgettable vacation. The villa features 4 spacious bedrooms, modern amenities, and elegant Egyptian-inspired décor.",
    images: [
      "https://images.unsplash.com/photo-1729720281771-b790dfb6ec7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWFjaCUyMHZpbGxhfGVufDF8fHx8MTc2MTA5ODc1Nnww&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1638310081327-5b4b5da6d155?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGNoYWxldCUyMHBvb2x8ZW58MXx8fHwxNzYxMTYxMzgzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1635690280190-0eec6bc587fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGhvdXNlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYxMTYxMzgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1678788762802-0c6c6cdd89fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaGZyb250JTIwcHJvcGVydHl8ZW58MXx8fHwxNzYxMTYxMzg0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      "https://images.unsplash.com/photo-1598635031829-4bfae29d33eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGVycmFuZWFuJTIwdmlsbGF8ZW58MXx8fHwxNzYxMTI5ODA1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    ],
  };

  const handleReserve = () => {
    onNavigate("booking-confirmation");
  };

  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;
  const totalPrice = nights * property.price;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-[#2B2B2B] mb-2">
            {property.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-[#2B2B2B] text-[#2B2B2B]" />
              <span className="font-semibold">{property.rating}</span>
              <span className="text-gray-600">
                ({property.reviews} reviews)
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{property.location}</span>
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-4 gap-2 h-[500px] mb-8 rounded-2xl overflow-hidden">
          <div className="col-span-2 row-span-2">
            <ImageWithFallback
              src={property.images[0]}
              alt="Main"
              className="w-full h-full object-cover hover:brightness-95 transition-all cursor-pointer"
              onClick={() => {
                setIsGalleryOpen(true);
                setCurrentImageIndex(0);
              }}
            />
          </div>
          {property.images.slice(1).map((img, idx) => (
            <div key={idx}>
              <ImageWithFallback
                src={img}
                alt={`Gallery ${idx + 2}`}
                className="w-full h-full object-cover hover:brightness-95 transition-all cursor-pointer"
                onClick={() => {
                  setIsGalleryOpen(true);
                  setCurrentImageIndex(idx + 1);
                }}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host Info */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#2B2B2B]">
                    Hosted by {property.host.name}
                  </h2>
                  <p className="text-gray-600">
                    4 bedrooms • 8 guests • 3 bathrooms
                  </p>
                </div>
                <Avatar className="h-14 w-14">
                  <AvatarImage src={property.host.avatar} />
                  <AvatarFallback className="bg-[#00BFA6] text-white">
                    {property.host.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>
              {property.host.verified && (
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-[#00BFA6]" />
                  <span>
                    Verified Host • {property.host.yearsHosting} years hosting
                  </span>
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="text-xl font-semibold text-[#2B2B2B] mb-4">
                About this place
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {property.description}
              </p>
            </div>

            <Separator />

            {/* Amenities */}
            <div>
              <h3 className="text-xl font-semibold text-[#2B2B2B] mb-4">
                Amenities
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {property.amenities.map((amenity, idx) => {
                  const Icon = amenity.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-700" />
                      <span>{amenity.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Reviews */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-6 h-6 fill-[#2B2B2B] text-[#2B2B2B]" />
                <h3 className="text-xl font-semibold text-[#2B2B2B]">
                  {property.rating} • {property.reviews} reviews
                </h3>
              </div>
              <div className="space-y-6">
                {[1, 2, 3].map((review) => (
                  <div key={review} className="flex gap-4">
                    <Avatar>
                      <AvatarFallback>U{review}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">Guest {review}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-600 text-sm">
                          2 weeks ago
                        </span>
                      </div>
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-4 h-4 fill-[#2B2B2B] text-[#2B2B2B]"
                          />
                        ))}
                      </div>
                      <p className="text-gray-700">
                        Amazing property with stunning views! The host was
                        incredibly welcoming and the location was perfect for
                        our family vacation.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Card - Sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 border border-gray-200 rounded-2xl p-6 shadow-xl">
              <div className="mb-6">
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-semibold text-[#2B2B2B]">
                    {property.price} EGP
                  </span>
                  <span className="text-gray-600">/ night</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-[#2B2B2B] text-[#2B2B2B]" />
                  <span className="font-semibold">{property.rating}</span>
                  <span className="text-gray-600">
                    ({property.reviews} reviews)
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start h-14">
                        <div className="text-left">
                          <div className="text-xs text-gray-500">Check-in</div>
                          <div className="text-sm">
                            {checkIn ? format(checkIn, "MMM dd") : "Add date"}
                          </div>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkIn}
                        onSelect={setCheckIn}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="justify-start h-14">
                        <div className="text-left">
                          <div className="text-xs text-gray-500">Check-out</div>
                          <div className="text-sm">
                            {checkOut ? format(checkOut, "MMM dd") : "Add date"}
                          </div>
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOut}
                        onSelect={setCheckOut}
                        initialFocus
                        disabled={(date) => (checkIn ? date < checkIn : false)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger className="h-14">
                    <div className="text-left">
                      <div className="text-xs text-gray-500">Guests</div>
                      <div className="text-sm">
                        <SelectValue placeholder="Add guests" />
                      </div>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Guest</SelectItem>
                    <SelectItem value="2">2 Guests</SelectItem>
                    <SelectItem value="3">3 Guests</SelectItem>
                    <SelectItem value="4">4 Guests</SelectItem>
                    <SelectItem value="5">5 Guests</SelectItem>
                    <SelectItem value="6">6 Guests</SelectItem>
                    <SelectItem value="7">7 Guests</SelectItem>
                    <SelectItem value="8">8 Guests</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleReserve}
                className="w-full h-12 bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
                size="lg"
                disabled={!checkIn || !checkOut || !guests}
              >
                Reserve
              </Button>

              {nights > 0 && (
                <>
                  <p className="text-center text-sm text-gray-600 mt-3">
                    You won't be charged yet
                  </p>

                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700">
                        {property.price} EGP × {nights} nights
                      </span>
                      <span>{totalPrice} EGP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Service fee</span>
                      <span>{Math.round(totalPrice * 0.1)} EGP</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>
                        {totalPrice + Math.round(totalPrice * 0.1)} EGP
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Dialog */}
      <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
        <DialogContent className="max-w-none w-screen h-screen p-0 gap-0 bg-black border-0 rounded-none">
          {/* Accessibility elements - visually hidden */}
          <DialogTitle className="sr-only">Property Photo Gallery</DialogTitle>
          <DialogDescription className="sr-only">
            Browse through property photos. Use arrow buttons or thumbnails to
            navigate. Image {currentImageIndex + 1} of {property.images.length}.
          </DialogDescription>

          {/* Image counter */}
          <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {property.images.length}
          </div>

          {/* Navigation Buttons */}
          {currentImageIndex > 0 && (
            <button
              onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
          )}

          {currentImageIndex < property.images.length - 1 && (
            <button
              onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 text-gray-900" />
            </button>
          )}

          {/* Main Image */}
          <div className="w-full h-full flex items-center justify-center p-8 pb-32">
            <ImageWithFallback
              src={property.images[currentImageIndex]}
              alt={`Gallery ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm p-4">
            <div className="flex gap-2 overflow-x-auto max-w-7xl mx-auto">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    currentImageIndex === idx
                      ? "border-[#00BFA6] scale-105"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`View image ${idx + 1}`}
                >
                  <ImageWithFallback
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
