import { useState, useEffect } from "react";
import { PropertyCard } from "../PropertyCard";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { SlidersHorizontal, Loader2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Language, translations } from "../../lib/translations";
import api, { PropertyResponse, SearchRequest } from "../../../api";

interface PropertiesPageProps {
  onNavigate: (page: string, propertyId?: string) => void;
  toggleFavourite?: (property: any) => void;
  isFavourite?: (propertyId: string) => boolean;
  language?: Language;
}

export function PropertiesPage({
  onNavigate,
  toggleFavourite,
  isFavourite,
  language = "en",
}: PropertiesPageProps) {
  const t = translations[language].properties;

  // Search filters state
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("recommended");

  // API state
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [governorates, setGovernorates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const filters = [
    {
      id: "all",
      label: language === "ar" ? "الكل" : "All",
      propertyType: undefined,
    },
    {
      id: "beachfront",
      label: language === "ar" ? "على الشاطئ" : "Beachfront",
      propertyType: "villa",
    },
    {
      id: "family",
      label: language === "ar" ? "منازل عائلية" : "Family Homes",
      propertyType: "house",
    },
    {
      id: "luxury",
      label: language === "ar" ? "فاخر" : "Luxury",
      propertyType: "villa",
    },
    {
      id: "chalet",
      label: language === "ar" ? "شاليه" : "Chalet",
      propertyType: "chalet",
    },
    {
      id: "apartment",
      label: language === "ar" ? "شقة" : "Apartment",
      propertyType: "apartment",
    },
  ];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (location) {
      loadCities(location);
    }
  }, [location]);

  useEffect(() => {
    searchProperties();
  }, [activeFilter, sortBy, currentPage, location, checkIn, checkOut, guests]);

  const loadInitialData = async () => {
    try {
      const govs = await api.getGovernorates();
      setGovernorates(govs);
    } catch (err) {
      console.error("Error loading governorates:", err);
    }
  };

  const loadCities = async (governorate: string) => {
    try {
      const citiesData = await api.getCities(governorate);
      setCities(citiesData);
    } catch (err) {
      console.error("Error loading cities:", err);
    }
  };

  const searchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams: SearchRequest = {
        page: currentPage,
        size: 12,
      };

      // Apply location filter
      if (location) {
        searchParams.governorate = location;
      }

      // Apply date filters
      if (checkIn) {
        searchParams.checkInDate = checkIn.toISOString().split("T")[0];
      }
      if (checkOut) {
        searchParams.checkOutDate = checkOut.toISOString().split("T")[0];
      }

      // Apply guests filter
      if (guests) {
        searchParams.minGuests = parseInt(guests);
      }

      // Apply property type filter
      const activeFilterData = filters.find((f) => f.id === activeFilter);
      if (activeFilterData?.propertyType) {
        searchParams.propertyType = activeFilterData.propertyType;
      }

      // Apply sorting
      switch (sortBy) {
        case "price-low":
          searchParams.sortBy = "pricePerNight";
          searchParams.sortDirection = "ASC";
          break;
        case "price-high":
          searchParams.sortBy = "pricePerNight";
          searchParams.sortDirection = "DESC";
          break;
        case "rating":
          searchParams.sortBy = "averageRating";
          searchParams.sortDirection = "DESC";
          break;
        default:
          searchParams.sortBy = "createdAt";
          searchParams.sortDirection = "DESC";
      }

      const response = await api.advancedSearch(searchParams);

      setProperties(response.properties);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
      setCurrentPage(response.pagination.currentPage);
    } catch (err) {
      console.error("Error searching properties:", err);
      setError("Failed to load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);
    setCurrentPage(0); // Reset to first page
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // Map PropertyResponse to PropertyCard format
  const mapPropertyToCard = (property: PropertyResponse) => ({
    id: property.propertyId.toString(),
    image:
      property.coverImage ||
      "https://images.unsplash.com/photo-1729720281771-b790dfb6ec7f",
    title: language === "ar" ? property.titleAr : property.titleEn,
    location: `${property.city}, ${property.governorate}`,
    rating: property.averageRating || 0,
    reviews: property.totalReviews || 0,
    price: property.pricePerNight || property.pricePerMonth || 0,
  });

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
                  {governorates.map((gov) => (
                    <SelectItem key={gov} value={gov}>
                      {gov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[160px] justify-start">
                    {checkIn
                      ? format(checkIn, "MMM dd")
                      : translations[language].propertyDetails.checkIn}
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
                  <Button variant="outline" className="w-[160px] justify-start">
                    {checkOut
                      ? format(checkOut, "MMM dd")
                      : translations[language].propertyDetails.checkOut}
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
                  <SelectValue
                    placeholder={
                      translations[language].propertyDetails.guestsLabel
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    {language === "ar" ? "١ ضيف" : "1 Guest"}
                  </SelectItem>
                  <SelectItem value="2">
                    {language === "ar" ? "٢ ضيوف" : "2 Guests"}
                  </SelectItem>
                  <SelectItem value="3">
                    {language === "ar" ? "٣ ضيوف" : "3 Guests"}
                  </SelectItem>
                  <SelectItem value="4">
                    {language === "ar" ? "٤ ضيوف" : "4 Guests"}
                  </SelectItem>
                  <SelectItem value="5">
                    {language === "ar" ? "٥ ضيوف" : "5 Guests"}
                  </SelectItem>
                  <SelectItem value="6">
                    {language === "ar" ? "٦+ ضيوف" : "6+ Guests"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={searchProperties}
              className="bg-[#00BFA6] hover:bg-[#00A890] text-white md:w-auto"
            >
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
              onClick={() => handleFilterChange(filter.id)}
            >
              {filter.label}
            </Badge>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#2B2B2B]">
            {loading
              ? language === "ar"
                ? "جاري البحث..."
                : "Searching..."
              : t.showingProperties.replace("{{count}}", totalItems.toString())}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {language === "ar" ? "ترتيب حسب:" : "Sort by:"}
            </span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">
                  {language === "ar" ? "موصى به" : "Recommended"}
                </SelectItem>
                <SelectItem value="price-low">
                  {language === "ar"
                    ? "السعر: من الأقل إلى الأعلى"
                    : "Price: Low to High"}
                </SelectItem>
                <SelectItem value="price-high">
                  {language === "ar"
                    ? "السعر: من الأعلى إلى الأقل"
                    : "Price: High to Low"}
                </SelectItem>
                <SelectItem value="rating">
                  {language === "ar" ? "الأعلى تقييماً" : "Highest Rated"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {loading && properties.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-48 bg-gray-200 animate-pulse rounded-2xl" />
                <div className="h-4 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">
              {language === "ar"
                ? "لم يتم العثور على عقارات تطابق البحث"
                : "No properties found matching your search"}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setLocation("");
                setCheckIn(undefined);
                setCheckOut(undefined);
                setGuests("");
                setActiveFilter("all");
                setCurrentPage(0);
              }}
            >
              {language === "ar" ? "إعادة تعيين الفلاتر" : "Reset Filters"}
            </Button>
          </div>
        ) : (
          <>
            {/* Properties Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {properties.map((property) => (
                <PropertyCard
                  key={property.propertyId}
                  {...mapPropertyToCard(property)}
                  onSelect={(id) => onNavigate("property-details", id)}
                  isFavourite={
                    isFavourite
                      ? isFavourite(property.propertyId.toString())
                      : false
                  }
                  onToggleFavourite={toggleFavourite}
                />
              ))}
            </div>

            {/* Load More */}
            {currentPage < totalPages - 1 && (
              <div className="text-center py-8">
                <Button
                  variant="outline"
                  size="lg"
                  className="min-w-[200px]"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === "ar" ? "جاري التحميل..." : "Loading..."}
                    </>
                  ) : language === "ar" ? (
                    "عرض المزيد من العقارات"
                  ) : (
                    "Show More Properties"
                  )}
                </Button>
              </div>
            )}

            {/* Pagination Info */}
            <div className="text-center text-sm text-gray-600 pb-8">
              {language === "ar"
                ? `عرض ${properties.length} من ${totalItems} عقار`
                : `Showing ${properties.length} of ${totalItems} properties`}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
