// src/components/pages/PropertiesPage.tsx - Fixed Version
import { useState, useEffect } from "react";
import { PropertyCard } from "../PropertyCard";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import api, { PropertyResponse, SearchRequest } from "../../../api";
import { toast } from "sonner";
import { Language } from "../../lib/translations";

interface PropertiesPageProps {
  onNavigate: (page: string, propertyId?: string) => void;
  language?: Language;
}

export function PropertiesPage({ onNavigate, language = "en" }: PropertiesPageProps) {
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Search filters
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [rentalType, setRentalType] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [bedrooms, setBedrooms] = useState("");
  const [furnished, setFurnished] = useState<boolean | undefined>(undefined);
  const [petsAllowed, setPetsAllowed] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState("recommended");
  
  // Dropdown options
  const [governorates, setGovernorates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check auth status
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
    
    // Load initial data
    loadGovernorates();
    searchProperties();
  }, []);

  useEffect(() => {
    if (governorate) {
      loadCities(governorate);
    }
  }, [governorate]);

  const loadGovernorates = async () => {
    try {
      const data = await api.getGovernorates();
      setGovernorates(data || []);
    } catch (err) {
      console.error("Error loading governorates:", err);
    }
  };

  const loadCities = async (gov: string) => {
    try {
      const data = await api.getCities(gov);
      setCities(data || []);
    } catch (err) {
      console.error("Error loading cities:", err);
    }
  };

  const searchProperties = async () => {
    try {
      setLoading(true);

      const searchParams: SearchRequest = {
        governorate: governorate || undefined,
        city: city || undefined,
        propertyType: propertyType || undefined,
        rentalType: rentalType || undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 50000 ? priceRange[1] : undefined,
        minBedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        furnished: furnished,
        petsAllowed: petsAllowed,
        sortBy: sortBy === "recommended" ? "averageRating" : sortBy,
        sortDirection: "DESC",
        page: 0,
        size: 20,
      };

      console.log("🔍 Search params:", searchParams);

      const response = await api.advancedSearch(searchParams);
      
      // ✅ Validate response
      if (response && Array.isArray(response.properties)) {
        setProperties(response.properties);
        console.log("✅ Found properties:", response.properties.length);
      } else {
        console.warn("⚠️ Invalid search response:", response);
        setProperties([]);
      }
    } catch (err: any) {
      console.error("❌ Search error:", err);
      toast.error("Failed to load properties");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    searchProperties();
  };

  const handleReset = () => {
    setGovernorate("");
    setCity("");
    setPropertyType("");
    setRentalType("");
    setPriceRange([0, 50000]);
    setBedrooms("");
    setFurnished(undefined);
    setPetsAllowed(undefined);
    setSortBy("recommended");
    
    // Reload all properties
    setTimeout(() => searchProperties(), 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-[#2B2B2B]">
                {language === "ar" ? "العقارات المتاحة" : "Available Properties"}
              </h1>
              <p className="text-gray-600 mt-1">
                {loading ? (
                  language === "ar" ? "جاري التحميل..." : "Loading..."
                ) : (
                  <>
                    {properties.length}{" "}
                    {language === "ar" ? "عقار متاح" : `propert${properties.length === 1 ? "y" : "ies"} available`}
                  </>
                )}
              </p>
            </div>
            
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {language === "ar" ? "الفلاتر" : "Filters"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 space-y-6 sticky top-8">
                <h3 className="font-semibold text-lg text-[#2B2B2B]">
                  {language === "ar" ? "تصفية النتائج" : "Filter Results"}
                </h3>

                {/* Location */}
                <div className="space-y-3">
                  <Label>{language === "ar" ? "الموقع" : "Location"}</Label>
                  <Select value={governorate} onValueChange={setGovernorate}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === "ar" ? "المحافظة" : "Governorate"} />
                    </SelectTrigger>
                    <SelectContent>
                      {governorates.map((gov) => (
                        <SelectItem key={gov} value={gov}>
                          {gov}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {governorate && (
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === "ar" ? "المدينة" : "City"} />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Property Type */}
                <div className="space-y-3">
                  <Label>{language === "ar" ? "نوع العقار" : "Property Type"}</Label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === "ar" ? "اختر النوع" : "Select type"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">{language === "ar" ? "شقة" : "Apartment"}</SelectItem>
                      <SelectItem value="villa">{language === "ar" ? "فيلا" : "Villa"}</SelectItem>
                      <SelectItem value="chalet">{language === "ar" ? "شاليه" : "Chalet"}</SelectItem>
                      <SelectItem value="studio">{language === "ar" ? "استوديو" : "Studio"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rental Type */}
                <div className="space-y-3">
                  <Label>{language === "ar" ? "نوع الإيجار" : "Rental Type"}</Label>
                  <Select value={rentalType} onValueChange={setRentalType}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === "ar" ? "اختر المدة" : "Select duration"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{language === "ar" ? "يومي" : "Daily"}</SelectItem>
                      <SelectItem value="weekly">{language === "ar" ? "أسبوعي" : "Weekly"}</SelectItem>
                      <SelectItem value="monthly">{language === "ar" ? "شهري" : "Monthly"}</SelectItem>
                      <SelectItem value="yearly">{language === "ar" ? "سنوي" : "Yearly"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <Label>
                    {language === "ar" ? "السعر" : "Price Range"}: {priceRange[0]} - {priceRange[1]} EGP
                  </Label>
                  <Slider
                    min={0}
                    max={50000}
                    step={500}
                    value={priceRange}
                    onValueChange={setPriceRange}
                  />
                </div>

                {/* Bedrooms */}
                <div className="space-y-3">
                  <Label>{language === "ar" ? "عدد الغرف" : "Bedrooms"}</Label>
                  <Select value={bedrooms} onValueChange={setBedrooms}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === "ar" ? "أي عدد" : "Any"} />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}+ {language === "ar" ? "غرف" : "bedrooms"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Furnished */}
                <div className="flex items-center justify-between">
                  <Label>{language === "ar" ? "مفروش" : "Furnished"}</Label>
                  <Switch checked={furnished || false} onCheckedChange={setFurnished} />
                </div>

                {/* Pets */}
                <div className="flex items-center justify-between">
                  <Label>{language === "ar" ? "يسمح بالحيوانات" : "Pets Allowed"}</Label>
                  <Switch checked={petsAllowed || false} onCheckedChange={setPetsAllowed} />
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-4">
                  <Button onClick={handleSearch} className="w-full bg-[#00BFA6] hover:bg-[#00A890]">
                    <Search className="w-4 h-4 mr-2" />
                    {language === "ar" ? "بحث" : "Search"}
                  </Button>
                  <Button onClick={handleReset} variant="outline" className="w-full">
                    {language === "ar" ? "إعادة تعيين" : "Reset Filters"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Properties Grid */}
          <div className="flex-1">
            {/* Sort */}
            <div className="mb-6 flex items-center justify-between">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">{language === "ar" ? "موصى به" : "Recommended"}</SelectItem>
                  <SelectItem value="pricePerNight">{language === "ar" ? "السعر" : "Price"}</SelectItem>
                  <SelectItem value="averageRating">{language === "ar" ? "التقييم" : "Rating"}</SelectItem>
                  <SelectItem value="createdAt">{language === "ar" ? "الأحدث" : "Newest"}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-[#00BFA6] animate-spin" />
              </div>
            )}

            {/* Empty State */}
            {!loading && properties.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">
                  {language === "ar" ? "لا توجد عقارات متاحة" : "No properties found"}
                </p>
                <Button onClick={handleReset} variant="outline" className="mt-4">
                  {language === "ar" ? "مسح الفلاتر" : "Clear Filters"}
                </Button>
              </div>
            )}

            {/* Properties Grid - ✅ FIXED */}
            {!loading && properties.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.propertyId}
                    property={property}
                    onNavigate={onNavigate}
                    language={language}
                    showFavorite={isLoggedIn}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}