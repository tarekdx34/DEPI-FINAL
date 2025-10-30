# Ajarly - Egyptian Vacation Rental Platform

## 🌊 Overview

Ajarly is a complete, bilingual (Arabic + English) vacation rental platform designed specifically for Egypt's Mediterranean coastline, covering Alexandria, Matrouh, and North Coast.

Inspired by Airbnb's modern, photo-first design language with Egyptian warmth and Mediterranean aesthetics.

---

## 🎨 Design System

### Color Palette
- **Turquoise Blue** (`#00BFA6`) - Primary brand color, accents, CTAs
- **Coral Red** (`#FF6B6B`) - Secondary CTAs, important actions
- **Sand Beige** (`#F9F6F1`) - Backgrounds, warmth
- **Dark Gray** (`#2B2B2B`) - Primary text
- **White** (`#ffffff`) - Cards, surfaces

### Typography
- **English**: Poppins / System Sans-serif
- **Arabic**: Cairo / Tajawal
- Weights: Regular (400), Medium (500), Semibold (600), Bold (700)

### Components
All components use ShadCN UI library with custom Ajarly theming:
- Buttons, Cards, Inputs, Selects, Calendars
- Dialogs, Sheets, Tabs, Badges
- Navigation, Dropdowns, Popovers

---

## 📱 Pages & Features

### 1. **Landing Page (Home)**
- **Hero Section**: Full-width image with search bar overlay
- **Search Bar**: Location, Check-in/out dates, Guest selector
- **Explore Nearby**: Alexandria, Matrouh, North Coast cards
- **Live Anywhere**: Category cards (Beachfront, Family Homes, Chalets, City Apartments)
- **Featured Properties**: Property grid with PropertyCard components
- **Why Ajarly**: 3 benefits (Verified Homes, Local Hosts, 24/7 Support)
- **Become a Host CTA**: Call-to-action banner

**Key Interactions**:
- Search redirects to Properties page
- Destination cards navigate to filtered properties
- Property cards open Property Details

---

### 2. **Login Page**
- Split-screen design (form + coastal image)
- Email + Password fields
- "Remember me" checkbox
- "Forgot password" link
- Social sign-in (Google, Facebook)
- Link to Register page

**Redirect**: User Dashboard on successful login

---

### 3. **Register Page**
- Split-screen design (image + form)
- Form fields:
  - Full Name
  - Email
  - Password & Confirm Password
  - National ID
  - Role selection: Renter / Owner (Host)
- Social sign-up options
- Link to Login page

**Redirect**: 
- Renter → User Dashboard
- Owner → Host Dashboard

---

### 4. **Properties Listing Page**
- **Sticky Search Bar**: Location, dates, guests filters
- **Filter Bar**: All, Beachfront, Family, Luxury, Pool, Budget
- **Sort Options**: Recommended, Price (Low/High), Rating
- **Property Grid**: 4 columns of PropertyCard components
- **Load More**: Infinite scroll / pagination

**Features**:
- Heart icon to favorite properties
- Click property → Property Details
- Real-time filter updates

---

### 5. **Property Details Page**
- **Image Gallery**: 5-photo grid layout
- **Property Info**: Title, rating, location, host details
- **Description**: Full property description
- **Amenities**: Grid of amenity icons + labels
- **Reviews**: User reviews with ratings
- **Sticky Booking Card**:
  - Price per night
  - Date pickers (check-in/out)
  - Guest selector
  - Price breakdown
  - "Reserve" button → Booking Confirmation

---

### 6. **Booking Confirmation Page**
- **Left Column**:
  - Trip details (dates, guests)
  - Payment method selection (Card, Fawry)
  - Card input fields
  - Cancellation policy
- **Right Column (Sticky)**:
  - Property summary card
  - Price breakdown
  - Total cost in EGP
  - "Confirm and Pay" button

**On Confirmation**:
- Success modal with confetti animation
- Booking confirmation code
- Redirect to User Dashboard

---

### 7. **User Dashboard (Renter)**
4 tabs with icon navigation:

#### **Trips Tab**
- Upcoming trips with property cards
- Past trips section
- Trip details: dates, confirmation code
- Actions: View Details, Contact Host

#### **Favorites Tab**
- Saved properties grid
- Click to view property details

#### **Profile Tab**
- Avatar upload
- Edit: Name, Email, Phone, Bio
- Save changes button

#### **Payments Tab**
- Saved payment methods
- Add/Remove cards
- Payment history

---

### 8. **Host Dashboard (Owner)**
4 tabs for property management:

#### **Listings Tab**
- Grid of host's properties
- Property cards with stats (views, bookings)
- Edit / Preview buttons
- "Add Property" button → Add Property Form

#### **Add Property Form**:
- **Basic Info**: Title, Type, Description
- **Location**: City, Address
- **Details**: Bedrooms, Bathrooms, Guests, Price
- **Amenities**: Checklist (WiFi, Pool, etc.)
- **Photos**: Drag & drop upload
- Actions: Publish / Save as Draft

#### **Bookings Tab**
- Upcoming guest reservations
- Guest details, dates, payment status

#### **Analytics Tab**
- Total Views card
- Total Bookings card
- Total Earnings card
- Growth percentages

#### **Settings Tab**
- Host profile settings
- Contact information
- Payout preferences

---

## 🧩 Reusable Components

### **Navbar**
- Logo (navigates to home)
- Navigation links: Explore, Become a Host
- Language toggle (EN / AR)
- Login / Sign up buttons
- Mobile-responsive with Sheet drawer

### **Footer**
- 4-column layout:
  - About Ajarly
  - Community
  - Hosting
  - Support
- Social media icons
- Copyright & legal links

### **PropertyCard**
- Property image with hover zoom
- Heart icon for favorites
- Title, location, rating, reviews
- Price per night in EGP
- Click → Property Details

---

## 🔄 User Flows

### **Guest Flow (Renter)**
1. Land on Homepage
2. Search for destination + dates
3. Browse Properties Listing
4. Select property → View Details
5. Choose dates + guests → Reserve
6. Booking Confirmation → Payment
7. Success → View in User Dashboard

### **Host Flow (Owner)**
1. Register as Owner
2. Access Host Dashboard
3. Add New Property (form)
4. Upload photos & set price
5. Publish listing
6. Manage bookings & analytics

---

## 🌍 Bilingual Support

### Language Toggle
- Dropdown in Navbar
- Switches between English (EN) and Arabic (AR)
- Updates all UI text dynamically
- Right-to-left (RTL) layout for Arabic

### Translation Keys (Sample)
```typescript
{
  en: {
    explore: "Explore",
    becomeHost: "Become a Host",
    login: "Log in",
    signup: "Sign up"
  },
  ar: {
    explore: "استكشف",
    becomeHost: "كن مضيفاً",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب"
  }
}
```

---

## 📐 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Adaptations
- Hamburger menu in Navbar
- Stacked search bar fields
- 1-column property grids
- Bottom navigation for dashboards
- Swipe gestures for image galleries

---

## 🎯 Key Features

### For Guests
✅ Smart search with location, dates, guests  
✅ Advanced filtering (price, amenities, property type)  
✅ Save favorites  
✅ Instant booking  
✅ Secure payments (Card, Fawry)  
✅ Trip management dashboard  
✅ Host communication  

### For Hosts
✅ Easy property listing  
✅ Photo upload & management  
✅ Pricing & availability control  
✅ Booking calendar  
✅ Analytics & earnings tracking  
✅ Guest communication  

---

## 🔐 Security & Trust

- **Verified Hosts**: Badge system
- **Secure Payments**: PCI-compliant processing
- **Reviews System**: Ratings & written reviews
- **24/7 Support**: Customer care team
- **Cancellation Policy**: Flexible options

---

## 🚀 Technology Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: ShadCN UI
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Image Handling**: Unsplash API
- **State Management**: React Hooks (useState)
- **Routing**: Custom navigation system

---

## 🎨 Visual Design Principles

1. **Photo-First**: Large, high-quality images
2. **Clean & Minimal**: White space, clear hierarchy
3. **Emotional**: Warm colors, inviting imagery
4. **Trustworthy**: Reviews, verified badges, clear pricing
5. **Egyptian Touch**: Mediterranean colors, local authenticity

---

## 📊 Mock Data Structure

### Property Object
```typescript
{
  id: string;
  title: string;
  location: string;
  price: number; // EGP per night
  rating: number; // 0-5
  reviews: number;
  images: string[];
  amenities: string[];
  host: {
    name: string;
    avatar: string;
    verified: boolean;
  };
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
}
```

---

## 🎉 Next Steps & Future Enhancements

- [ ] Real backend integration (Supabase)
- [ ] User authentication (JWT)
- [ ] Real-time booking availability
- [ ] Chat system (host-guest messaging)
- [ ] Map integration (Google Maps)
- [ ] Advanced analytics for hosts
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration (Stripe, Fawry)
- [ ] Email notifications
- [ ] Multi-currency support

---

## 📝 Notes

- All pages are fully functional with mock data
- Navigation works seamlessly between pages
- Form validations are basic (client-side only)
- Images are sourced from Unsplash
- Designed for modern browsers (Chrome, Safari, Firefox, Edge)

---

**Built with ❤️ for Egypt's beautiful coastline**

*Ajarly - Your gateway to Mediterranean paradise*
