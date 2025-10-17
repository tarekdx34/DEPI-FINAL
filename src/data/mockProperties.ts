import property1 from "@/assets/property1.jpg";
import property2 from "@/assets/property2.jpg";
import property3 from "@/assets/property3.jpg";
import property4 from "@/assets/property4.jpg";

export interface Property {
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
  description: string;
  amenities: string[];
  rating: number;
  reviews: number;
}

export const mockProperties: Property[] = [
  {
    id: "1",
    title: "Luxury Sea View Apartment",
    location: "Alexandria, Corniche",
    price: 2500,
    image: property1,
    bedrooms: 3,
    bathrooms: 2,
    area: 180,
    type: "Apartment",
    featured: true,
    description:
      "Beautiful modern apartment with stunning Mediterranean sea views. Located on the famous Alexandria Corniche, this property offers luxury living with easy beach access. Perfect for families or groups looking for a comfortable coastal vacation.",
    amenities: ["WiFi", "Sea View", "Balcony", "Parking", "Air Conditioning", "Kitchen", "Smart TV"],
    rating: 4.8,
    reviews: 42,
  },
  {
    id: "2",
    title: "Beachfront Chalet with Pool",
    location: "Matrouh, North Coast",
    price: 3500,
    image: property2,
    bedrooms: 4,
    bathrooms: 3,
    area: 250,
    type: "Chalet",
    featured: true,
    description:
      "Stunning beachfront chalet with private pool and direct beach access. This luxurious property features modern architecture and spectacular ocean views from every room. Ideal for those seeking privacy and luxury.",
    amenities: ["WiFi", "Private Pool", "Beach Access", "Garden", "BBQ Area", "Parking", "Security"],
    rating: 4.9,
    reviews: 28,
  },
  {
    id: "3",
    title: "Elegant Beach Villa",
    location: "Alexandria, Agami",
    price: 4000,
    image: property3,
    bedrooms: 5,
    bathrooms: 4,
    area: 320,
    type: "Villa",
    description:
      "Spacious luxury villa with panoramic ocean views and elegant coastal interior design. Features include a master bedroom with sea views, modern kitchen, and large outdoor spaces perfect for entertaining.",
    amenities: ["WiFi", "Sea View", "Multiple Balconies", "Parking", "Jacuzzi", "Smart Home"],
    rating: 4.7,
    reviews: 35,
  },
  {
    id: "4",
    title: "Modern Coastal Studio",
    location: "Matrouh, Marina",
    price: 1500,
    image: property4,
    bedrooms: 1,
    bathrooms: 1,
    area: 65,
    type: "Studio",
    description:
      "Cozy modern studio with beautiful balcony and Mediterranean sea views. Perfect for couples or solo travelers seeking a peaceful retreat. Walking distance to beaches, restaurants, and local attractions.",
    amenities: ["WiFi", "Sea View", "Balcony", "Air Conditioning", "Kitchenette"],
    rating: 4.6,
    reviews: 18,
  },
];
