import { Search, Shield, Users, Clock, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
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
import { useState } from "react";
import { Property } from "../../App";
import { Language, translations } from "../../lib/translations";

interface HomePageProps {
  onNavigate: (page: string, propertyId?: string) => void;
  toggleFavourite?: (property: Property) => void;
  isFavourite?: (propertyId: string) => boolean;
  language?: Language;
  user?: import("../../App").User | null;
}

export function HomePage({
  onNavigate,
  toggleFavourite,
  isFavourite,
  language = "en",
}: HomePageProps) {
  const t = translations[language].home;
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState("");

  const handleSearch = () => {
    onNavigate("properties");
  };

  const destinations = [
    {
      name: "Alexandria",
      image:
        "https://images.unsplash.com/photo-1760973566831-4d029dc31c3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbGV4YW5kcmlhJTIwZWd5cHQlMjB3YXRlcmZyb250fGVufDF8fHx8MTc2MTE2MTM3OXww&ixlib=rb-4.1.0&q=80&w=1080",
      properties: "200+ properties",
    },
    {
      name: "Matrouh",
      image:
        "https://images.unsplash.com/photo-1593663094448-9ea85c6e8456?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZ3lwdCUyMGJlYWNoJTIwbWVkaXRlcnJhbmVhbnxlbnwxfHx8fDE3NjExNjEzNzh8MA&ixlib=rb-4.1.0&q=80&w=1080",
      properties: "150+ properties",
    },
    {
      name: "North Coast",
      image:
        "https://images.unsplash.com/photo-1758983198369-7a424e3a482c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2FzdGFsJTIwc3Vuc2V0JTIwZWd5cHR8ZW58MXx8fHwxNzYxMTYxMzc5fDA&ixlib=rb-4.1.0&q=80&w=1080",
      properties: "300+ properties",
    },
  ];

  const categories = [
    {
      title: "Beachfront",
      image:
        "https://images.unsplash.com/photo-1678788762802-0c6c6cdd89fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaGZyb250JTIwcHJvcGVydHl8ZW58MXx8fHwxNzYxMTYxMzg0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      title: "Family Homes",
      image:
        "https://images.unsplash.com/photo-1629359080404-2dafcfd9f159?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjB2YWNhdGlvbiUyMGhvbWV8ZW58MXx8fHwxNzYxMTYxMzgzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      title: "Chalets",
      image:
        "https://images.unsplash.com/photo-1638310081327-5b4b5da6d155?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGNoYWxldCUyMHBvb2x8ZW58MXx8fHwxNzYxMTYxMzgzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      title: "City Apartments",
      image:
        "https://images.unsplash.com/photo-1700126689261-1f5bdfe5adcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBjaXR5fGVufDF8fHx8MTc2MTEwNjkyM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    },
  ];

  const featuredProperties = [
    {
      id: "1",
      image:
        "https://images.unsplash.com/photo-1729720281771-b790dfb6ec7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWFjaCUyMHZpbGxhfGVufDF8fHx8MTc2MTA5ODc1Nnww&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Luxury Beachfront Villa",
      location: "North Coast, Egypt",
      rating: 4.9,
      reviews: 128,
      price: 3500,
    },
    {
      id: "2",
      image:
        "https://images.unsplash.com/photo-1598635031829-4bfae29d33eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGVycmFuZWFuJTIwdmlsbGF8ZW58MXx8fHwxNzYxMTI5ODA1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Mediterranean Villa with Pool",
      location: "Alexandria, Egypt",
      rating: 4.8,
      reviews: 95,
      price: 2800,
    },
    {
      id: "3",
      image:
        "https://images.unsplash.com/photo-1635690280190-0eec6bc587fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGhvdXNlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYxMTYxMzgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Cozy Beach House",
      location: "Matrouh, Egypt",
      rating: 4.7,
      reviews: 64,
      price: 1800,
    },
    {
      id: "4",
      image:
        "https://images.unsplash.com/photo-1638310081327-5b4b5da6d155?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGNoYWxldCUyMHBvb2x8ZW58MXx8fHwxNzYxMTYxMzgzfDA&ixlib=rb-4.1.0&q=80&w=1080",
      title: "Modern Chalet with Private Pool",
      location: "North Coast, Egypt",
      rating: 5.0,
      reviews: 42,
      price: 4200,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[600px] flex items-center justify-center">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1593663094448-9ea85c6e8456?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlZ3lwdCUyMGJlYWNoJTIwbWVkaXRlcnJhbmVhbnxlbnwxfHx8fDE3NjExNjEzNzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Egyptian Coast"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            {t.heroTitle}{" "}
            <span className="text-[#00BFA6]">{t.heroTitleHighlight}</span>
          </h1>
          <p className="text-xl text-white/90 mb-8">{t.heroSubtitle}</p>

          {/* Search Bar */}
          <div className="bg-white rounded-full shadow-2xl p-2 flex flex-col md:flex-row items-stretch md:items-center gap-2">
            <div className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="border-0 bg-transparent h-auto p-0 focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder={t.searchPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alexandria">
                    {language === "ar" ? "الإسكندرية" : "Alexandria"}
                  </SelectItem>
                  <SelectItem value="matrouh">
                    {language === "ar" ? "مطروح" : "Matrouh"}
                  </SelectItem>
                  <SelectItem value="north-coast">
                    {language === "ar" ? "الساحل الشمالي" : "North Coast"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <button className="flex-1 px-4 py-3 text-left border-b md:border-b-0 md:border-r border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="text-sm text-gray-500 block">
                    {t.checkIn}
                  </span>
                  <span className="font-medium">
                    {checkIn ? format(checkIn, "MMM dd") : t.selectDates}
                  </span>
                </button>
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
                <button className="flex-1 px-4 py-3 text-left border-b md:border-b-0 md:border-r border-gray-200 hover:bg-gray-50 rounded-lg transition-colors">
                  <span className="text-sm text-gray-500 block">
                    {t.checkOut}
                  </span>
                  <span className="font-medium">
                    {checkOut ? format(checkOut, "MMM dd") : t.selectDates}
                  </span>
                </button>
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

            <div className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger className="border-0 bg-transparent h-auto p-0 focus:ring-0 focus:ring-offset-0">
                  <SelectValue placeholder={t.guests} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    {language === "ar" ? "٢ ضيف" : "1 Guest"}
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
              onClick={handleSearch}
              size="lg"
              className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white rounded-full px-8"
            >
              <Search
                className={`w-5 h-5 ${language === "ar" ? "ml-2" : "mr-2"}`}
              />
              {t.search}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Explore Nearby */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-[#2B2B2B] mb-8">
            {t.popularDestinations}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destinations.map((destination) => (
              <button
                key={destination.name}
                onClick={() => onNavigate("properties")}
                className="group relative overflow-hidden rounded-2xl h-64 hover:shadow-xl transition-shadow"
              >
                <ImageWithFallback
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div
                  className={`absolute bottom-6 ${
                    language === "ar" ? "right-6" : "left-6"
                  } text-white`}
                >
                  <h3 className="text-2xl font-semibold mb-1">
                    {language === "ar"
                      ? destination.name === "Alexandria"
                        ? "الإسكندرية"
                        : destination.name === "Matrouh"
                        ? "مطروح"
                        : "الساحل الشمالي"
                      : destination.name}
                  </h3>
                  <p className="text-sm text-white/90">
                    {language === "ar"
                      ? destination.properties.replace("properties", "عقار")
                      : destination.properties}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Live Anywhere */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-[#2B2B2B] mb-8">
            {language === "ar" ? "عش في أي مكان" : "Live Anywhere"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <button
                key={category.title}
                onClick={() => onNavigate("properties")}
                className="group text-left"
              >
                <div className="relative overflow-hidden rounded-xl aspect-square mb-3">
                  <ImageWithFallback
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <h3 className="font-semibold text-[#2B2B2B]">
                  {category.title}
                </h3>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Properties */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-semibold text-[#2B2B2B]">
              {t.featuredProperties}
            </h2>
            <Button
              variant="ghost"
              onClick={() => onNavigate("properties")}
              className="text-[#00BFA6] hover:text-[#00A890] gap-1"
            >
              {language === "ar" ? "عرض الكل" : "View all"}
              <ChevronRight
                className={`w-4 h-4 ${language === "ar" ? "rotate-180" : ""}`}
              />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                onSelect={(id) => onNavigate("property-details", id)}
                isFavourite={isFavourite ? isFavourite(property.id) : false}
                onToggleFavourite={toggleFavourite}
              />
            ))}
          </div>
        </section>

        {/* Why Ajarly */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-[#2B2B2B] mb-8 text-center">
            {t.whyChooseAjarly}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00BFA6] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">
                {t.trustedPlatform}
              </h3>
              <p className="text-gray-600">{t.trustedDesc}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00BFA6] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">
                {t.localExpertise}
              </h3>
              <p className="text-gray-600">{t.localExpertiseDesc}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00BFA6] rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">
                {t.support247}
              </h3>
              <p className="text-gray-600">{t.supportDesc}</p>
            </div>
          </div>
        </section>

        {/* Become a Host CTA */}
        <section className="bg-gradient-to-r from-[#00BFA6] to-[#00A890] rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            {language === "ar" ? "كن مضيفاً اليوم" : "Become a Host Today"}
          </h2>
          <p className="text-xl mb-8 text-white/90">
            {language === "ar"
              ? "شارك مساحتك واكسب دخلاً إضافياً مع أجارلي"
              : "Share your space and earn extra income with Ajarly"}
          </p>
          <Button
            onClick={() => onNavigate("host-dashboard")}
            size="lg"
            className="bg-white text-[#00BFA6] hover:bg-gray-100"
          >
            {language === "ar" ? "ابدأ الآن" : "Get Started"}
          </Button>
        </section>
      </div>
    </div>
  );
}
