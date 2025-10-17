import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import PropertyCard from "@/components/PropertyCard";
import { mockProperties } from "@/data/mockProperties";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Clock, MapPin, Star } from "lucide-react";

const Index = () => {
  const featuredProperties = mockProperties.filter((p) => p.featured);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />

      <section className="container px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-foreground">Featured Properties</h2>
          <p className="text-lg text-muted-foreground">
            Handpicked vacation homes for your perfect getaway
          </p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {featuredProperties.map((property) => (
            <PropertyCard key={property.id} {...property} />
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg">
            <Link to="/properties">View All Properties</Link>
          </Button>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground">Why Choose Ajarly?</h2>
            <p className="text-lg text-muted-foreground">
              Your trusted partner for coastal vacation rentals
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-md transition-shadow hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Verified Properties</h3>
                <p className="text-muted-foreground">
                  All properties are verified for your safety and comfort
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md transition-shadow hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Instant Booking</h3>
                <p className="text-muted-foreground">
                  Quick and easy booking process with instant confirmation
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md transition-shadow hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Prime Locations</h3>
                <p className="text-muted-foreground">
                  Properties in the best coastal locations in Egypt
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md transition-shadow hover:shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Star className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Top Rated Hosts</h3>
                <p className="text-muted-foreground">
                  Experienced hosts committed to your great experience
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container px-4 py-16">
        <div className="rounded-3xl bg-[var(--ocean-gradient)] p-12 text-center text-white shadow-xl">
          <h2 className="mb-4 text-4xl font-bold">Ready to List Your Property?</h2>
          <p className="mb-8 text-xl text-white/90">
            Join thousands of property owners earning with Ajarly
          </p>
          <Button variant="secondary" size="lg" className="shadow-md">
            Get Started Today
          </Button>
        </div>
      </section>

      <footer className="border-t bg-muted/30 py-12">
        <div className="container px-4">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-semibold">About Ajarly</h3>
              <p className="text-sm text-muted-foreground">
                Your trusted platform for vacation rentals in Alexandria, Matrouh, and across Egypt.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/properties" className="text-muted-foreground hover:text-primary">
                    Browse Properties
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    List Your Property
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold">Connect</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 Ajarly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
