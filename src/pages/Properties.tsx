import { useState } from "react";
import Header from "@/components/Header";
import PropertyCard from "@/components/PropertyCard";
import { mockProperties } from "@/data/mockProperties";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";

const Properties = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const filteredProperties = mockProperties
    .filter((property) => {
      const matchesSearch =
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = propertyType === "all" || property.type === propertyType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      return 0;
    });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-foreground">Browse Properties</h1>
          <p className="text-lg text-muted-foreground">
            Discover your perfect vacation home in Alexandria & Matrouh
          </p>
        </div>

        <div className="mb-8 space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_200px_200px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by location or property name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Apartment">Apartment</SelectItem>
                <SelectItem value="Chalet">Chalet</SelectItem>
                <SelectItem value="Villa">Villa</SelectItem>
                <SelectItem value="Studio">Studio</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-xl text-muted-foreground">No properties found matching your criteria.</p>
            <Button
              variant="link"
              onClick={() => {
                setSearchTerm("");
                setPropertyType("all");
              }}
              className="mt-4"
            >
              Clear filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Properties;
