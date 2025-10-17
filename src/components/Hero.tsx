import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative h-[600px] w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/80 via-primary/70 to-transparent" />
      </div>

      <div className="container relative z-10 flex h-full flex-col justify-center px-4 text-white">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
            Find Your Perfect
            <br />
            Coastal Getaway
          </h1>
          <p className="text-xl text-white/90 md:text-2xl">
            Discover vacation homes and rentals in Alexandria & Matrouh
          </p>

          <div className="mt-8 rounded-2xl bg-white p-4 shadow-2xl">
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto] md:gap-4">
              <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Where do you want to go?"
                  className="border-0 bg-transparent p-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                />
              </div>
              <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <Input
                  type="date"
                  placeholder="Check-in date"
                  className="border-0 bg-transparent p-0 text-foreground focus-visible:ring-0"
                />
              </div>
              <Button variant="hero" size="lg" className="h-auto py-3">
                <Search className="mr-2 h-5 w-5" />
                Search
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4">
            <button className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/30">
              Alexandria
            </button>
            <button className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/30">
              Matrouh
            </button>
            <button className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/30">
              Beachfront
            </button>
            <button className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/30">
              Chalets
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
