import { useState } from "react";
import { PropertyCard } from "../PropertyCard";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { SlidersHorizontal, MapPin } from "lucide-react";
import { Badge } from "../ui/badge";
import { Property } from "../../App";
import { Language, translations } from "../../lib/translations";

interface PropertiesPageProps {
  onNavigate: (page: string, propertyId?: string) => void;
  toggleFavourite?: (property: Property) => void;
  isFavourite?: (propertyId: string) => boolean;
  language?: Language;
}

export function PropertiesPage({ onNavigate, toggleFavourite, isFavourite, language = "en" }: PropertiesPageProps) {
  const t = translations[language].properties;
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const filters = [
    { id: "all", label: language === "ar" ? "الكل" : "All" },
    { id: "beachfront", label: language === "ar" ? "على الشاطئ" : "Beachfront" },
    { id: "family", label: language === "ar" ? "منازل عائلية" : "Family Homes" },
    { id: "luxury", label: language === "ar" ? "فاخر" : "Luxury" },
    { id: "pool", label: language === "ar" ? "مسبح" : "Pool" },
    { id: "budget", label: language === "ar" ? "ميزانية محدودة" : "Budget Friendly" },
  ];

  const properties = [
    {
      id: "1",
      image: "https://images.unsplash.com/photo-1729720281771-b790dfb6ec7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWFjaCUyMHZpbGxhfGVufDF8fHx8MTc2MTA5ODc1Nnww&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Luxury Beachfront Villa",
      location: "North Coast, Egypt",
      rating: 4.9,
      reviews: 128,
      price: 3500,
    },
    {
      id: "2",
      image: "https://images.unsplash.com/photo-1598635031829-4bfae29d33eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGVycmFuZWFuJTIwdmlsbGF8ZW58MXx8fHwxNzYxMTI5ODA1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Mediterranean Villa with Pool",
      location: "Alexandria, Egypt",
      rating: 4.8,
      reviews: 95,
      price: 2800,
    },
    {
      id: "3",
      image: "https://images.unsplash.com/photo-1635690280190-0eec6bc587fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGhvdXNlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYxMTYxMzgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Cozy Beach House",
      location: "Matrouh, Egypt",
      rating: 4.7,
      reviews: 64,
      price: 1800,
    },
    {
      id: "4",
      image: "https://images.unsplash.com/photo-1638310081327-5b4b5da6d155?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGNoYWxldCUyMHBvb2x8ZW58MXx8fHwxNzYxMTYxMzgzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Modern Chalet with Private Pool",
      location: "North Coast, Egypt",
      rating: 5.0,
      reviews: 42,
      price: 4200,
    },
    {
      id: "5",
      image: "https://images.unsplash.com/photo-1629359080404-2dafcfd9f159?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjB2YWNhdGlvbiUyMGhvbWV8ZW58MXx8fHwxNzYxMTYxMzgzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Spacious Family Villa",
      location: "Alexandria, Egypt",
      rating: 4.6,
      reviews: 87,
      price: 2200,
    },
    {
      id: "6",
      image: "https://images.unsplash.com/photo-1700126689261-1f5bdfe5adcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBjaXR5fGVufDF8fHx8MTc2MTEwNjkyM3ww&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Modern City Apartment",
      location: "Alexandria, Egypt",
      rating: 4.8,
      reviews: 112,
      price: 1500,
    },
    {
      id: "7",
      image: "https://images.unsplash.com/photo-1678788762802-0c6c6cdd89fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaGZyb250JTIwcHJvcGVydHl8ZW58MXx8fHwxNzYxMTYxMzg0fDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Stunning Beachfront Property",
      location: "North Coast, Egypt",
      rating: 4.9,
      reviews: 156,
      price: 3800,
    },
    {
      id: "8",
      image: "https://images.unsplash.com/photo-1593663094448-9ea85c6e8456?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZ3lwdCUyMGJlYWNoJTIwbWVkaXRlcnJhbmVhbnxlbnwxfHx8fDE3NjExNjEzNzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Charming Coastal Retreat",
      location: "Matrouh, Egypt",
      rating: 4.7,
      reviews: 73,
      price: 1950,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Sticky Search Bar */}
      <div className="sticky top-20 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="flex-1 flex flex-wrap gap-2 items-center">
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t.location} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alexandria">{language === "ar" ? "الإسكندرية" : "Alexandria"}</SelectItem>
                  <SelectItem value="matrouh">{language === "ar" ? "مطروح" : "Matrouh"}</SelectItem>
                  <SelectItem value="north-coast">{language === "ar" ? "الساحل الشمالي" : "North Coast"}</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[160px] justify-start">
                    {checkIn ? format(checkIn, "MMM dd") : translations[language].propertyDetails.checkIn}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} initialFocus />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[160px] justify-start">
                    {checkOut ? format(checkOut, "MMM dd") : translations[language].propertyDetails.checkOut}
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

              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={translations[language].propertyDetails.guestsLabel} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{language === "ar" ? "٢ ضيف" : "1 Guest"}</SelectItem>
                  <SelectItem value="2">{language === "ar" ? "٢ ضيوف" : "2 Guests"}</SelectItem>
                  <SelectItem value="3">{language === "ar" ? "٣ ضيوف" : "3 Guests"}</SelectItem>
                  <SelectItem value="4">{language === "ar" ? "٤ ضيوف" : "4 Guests"}</SelectItem>
                  <SelectItem value="5">{language === "ar" ? "٥ ضيوف" : "5 Guests"}</SelectItem>
                  <SelectItem value="6">{language === "ar" ? "٦+ ضيوف" : "6+ Guests"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="bg-[#00BFA6] hover:bg-[#00A890] text-white md:w-auto">
              {translations[language].home.search}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
            <SlidersHorizontal className="w-4 h-4" />
            {t.filters}
          </Button>
          {filters.map((filter) => (
            <Badge
              key={filter.id}
              variant={activeFilter === filter.id ? "default" : "outline"}
              className={`cursor-pointer px-4 py-2 flex-shrink-0 ${
                activeFilter === filter.id
                  ? "bg-[#00BFA6] hover:bg-[#00A890] text-white"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </Badge>
          ))}
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#2B2B2B]">
            {t.showingProperties.replace("{{count}}", properties.length.toString())}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{language === "ar" ? "ترتيب حسب:" : "Sort by:"}</span>
            <Select defaultValue="recommended">
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">{language === "ar" ? "موصى به" : "Recommended"}</SelectItem>
                <SelectItem value="price-low">{language === "ar" ? "السعر: من الأقل إلى الأعلى" : "Price: Low to High"}</SelectItem>
                <SelectItem value="price-high">{language === "ar" ? "السعر: من الأعلى إلى الأقل" : "Price: High to Low"}</SelectItem>
                <SelectItem value="rating">{language === "ar" ? "الأعلى تقييماً" : "Highest Rated"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
              onSelect={(id) => onNavigate("property-details", id)}
              isFavourite={isFavourite ? isFavourite(property.id) : false}
              onToggleFavourite={toggleFavourite}
            />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center py-8">
          <Button variant="outline" size="lg" className="min-w-[200px]">
            {language === "ar" ? "عرض المزيد من العقارات" : "Show More Properties"}
          </Button>
        </div>
      </div>
    </div>
  );
}