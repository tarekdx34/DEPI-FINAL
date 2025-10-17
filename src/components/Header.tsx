import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Search, Heart, User, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ocean-gradient)] shadow-md">
            <Home className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-primary">Ajarly</span>
          <span className="hidden text-sm text-muted-foreground sm:block">أجارلي</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link to="/" className="text-sm font-medium text-foreground transition-colors hover:text-primary">
            Home
          </Link>
          <Link to="/properties" className="text-sm font-medium text-foreground transition-colors hover:text-primary">
            Browse Properties
          </Link>
          <Link to="/about" className="text-sm font-medium text-foreground transition-colors hover:text-primary">
            About
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
            <Link to="/auth">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button size="sm" className="hidden md:flex" asChild>
            <Link to="/dashboard">Dashboard</Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to="/">Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/properties">Browse Properties</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/about">About</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Favorites</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/auth">Login / Sign Up</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>List Your Property</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

export default Header;
