# 🌍 Ajarly Bilingual Implementation Guide

## ✅ What's Already Implemented

### **Global RTL Support**
- ✅ `App.tsx` manages language state globally
- ✅ Automatic RTL switching via `document.documentElement.dir`
- ✅ Language persists across page navigation
- ✅ `Navbar` receives `language` and `onLanguageChange` props
- ✅ `Footer` fully translated and supports RTL

### **Translation System**
- ✅ Comprehensive translations in `/lib/translations.ts`
- ✅ All pages have English and Arabic translations
- ✅ Easy-to-use translation object structure

---

## 🔧 How to Add Language Support to Pages

### **Step 1: Add Language Prop to Page Component**

```typescript
import { Language, translations } from "../lib/translations";

interface YourPageProps {
  onNavigate: (page: string) => void;
  language?: Language;  // Add this
}

export function YourPage({ onNavigate, language = "en" }: YourPageProps) {
  const t = translations[language].yourSection;  // Use appropriate section
  
  // Your component code...
}
```

### **Step 2: Pass Language from App.tsx**

In `/App.tsx`, update the `renderPage()` function to pass language to each page:

```typescript
const renderPage = () => {
  switch (currentPage) {
    case "about":
      return <AboutUsPage onNavigate={handleNavigate} language={language} />;
    case "contact":
      return <ContactPage onNavigate={handleNavigate} language={language} />;
    // ... add to all pages
  }
};
```

### **Step 3: Replace Hard-coded Text with Translations**

**Before:**
```tsx
<h1>About Ajarly</h1>
<p>Connecting travelers with Egypt's coast</p>
```

**After:**
```tsx
<h1>{t.title}</h1>
<p>{t.subtitle}</p>
```

---

## 📋 Page-by-Page Implementation Checklist

### ✅ Already Complete
- [x] `Navbar.tsx` - Fully bilingual
- [x] `Footer.tsx` - Fully bilingual

### 🔄 Need Implementation

#### **Static Pages**
- [ ] `AboutUsPage.tsx` → Use `translations[lang].about`
- [ ] `ContactPage.tsx` → Use `translations[lang].contact`
- [ ] `FAQPage.tsx` → Use `translations[lang].faq`
- [ ] `SupportPage.tsx` → Use `translations[lang].support`
- [ ] `PrivacyPolicyPage.tsx` → Use `translations[lang].privacy`
- [ ] `TermsConditionsPage.tsx` → Use `translations[lang].terms`

#### **Core Pages**
- [ ] `HomePage.tsx` → Use `translations[lang].home`
- [ ] `PropertiesPage.tsx` → Use `translations[lang].properties`
- [ ] `PropertyDetailsPage.tsx` → Use `translations[lang].propertyDetails`
- [ ] `LoginPage.tsx` → Use `translations[lang].login`
- [ ] `RegisterPage.tsx` → Use `translations[lang].register`
- [ ] `ForgotPasswordPage.tsx` → Use `translations[lang].forgotPassword`
- [ ] `BookingConfirmationPage.tsx` → Use `translations[lang].booking`

#### **Dashboard Pages**
- [ ] `UserDashboard.tsx` → Use `translations[lang].userDashboard`
- [ ] `HostDashboard.tsx` → Use `translations[lang].hostDashboard`
- [ ] `AdminDashboard.tsx` → Use `translations[lang].admin`

---

## 📝 Quick Implementation Example

### Example: Updating `AboutUsPage.tsx`

**Step 1: Update Props and Import**
```typescript
import { Language, translations } from "../lib/translations";

interface AboutUsPageProps {
  onNavigate: (page: string) => void;
  language?: Language;
}

export function AboutUsPage({ onNavigate, language = "en" }: AboutUsPageProps) {
  const t = translations[language].about;
```

**Step 2: Replace Text**
```tsx
{/* Before */}
<h1 className="text-5xl md:text-6xl font-bold mb-4">About Ajarly</h1>

{/* After */}
<h1 className="text-5xl md:text-6xl font-bold mb-4">{t.title}</h1>
```

**Step 3: Update in App.tsx**
```typescript
case "about":
  return <AboutUsPage onNavigate={handleNavigate} language={language} />;
```

---

## 🎨 RTL-Specific Styling Considerations

### **Automatic RTL Handling**
When Arabic is selected, `dir="rtl"` is applied to `<html>`, which automatically:
- ✅ Reverses flex/grid layouts
- ✅ Mirrors padding/margin (left ↔ right)
- ✅ Flips text alignment
- ✅ Reverses horizontal scrolling

### **Manual RTL Fixes (if needed)**

**Use Logical Properties:**
```css
/* Instead of */
margin-left: 16px;

/* Use */
margin-inline-start: 16px;
```

**Icons that shouldn't flip:**
```tsx
<ChevronRight className={language === "ar" ? "rotate-180" : ""} />
```

**Conditional classes:**
```tsx
className={`flex ${language === "ar" ? "flex-row-reverse" : "flex-row"}`}
```

---

## 🔍 Translation Keys Reference

All translations are in `/lib/translations.ts`. Here's the structure:

```typescript
translations = {
  en: {
    nav: { ... },           // Navbar translations
    footer: { ... },        // Footer translations
    home: { ... },          // Home page
    properties: { ... },    // Properties page
    propertyDetails: { ... }, // Property details
    login: { ... },         // Login page
    register: { ... },      // Register page
    booking: { ... },       // Booking confirmation
    userDashboard: { ... }, // User dashboard
    hostDashboard: { ... }, // Host dashboard
    admin: { ... },         // Admin dashboard
    about: { ... },         // About us page
    contact: { ... },       // Contact page
    faq: { ... },           // FAQ page
    support: { ... },       // Support page
    privacy: { ... },       // Privacy policy
    terms: { ... },         // Terms & conditions
    common: { ... },        // Common UI text
  },
  ar: {
    // Same structure, Arabic translations
  }
}
```

---

## 🚀 Quick Start: Implement on One Page

To test the full bilingual system, start with one page:

### **1. Update `HomePage.tsx`:**

```typescript
import { Language, translations } from "../lib/translations";

interface HomePageProps {
  onNavigate: (page: string) => void;
  toggleFavourite: (property: Property) => void;
  isFavourite: (propertyId: string) => boolean;
  language?: Language;
}

export function HomePage({ 
  onNavigate, 
  toggleFavourite, 
  isFavourite, 
  language = "en" 
}: HomePageProps) {
  const t = translations[language].home;
  
  return (
    <div>
      <h1>{t.heroTitle} {t.heroTitleHighlight}</h1>
      <p>{t.heroSubtitle}</p>
      {/* Replace all hard-coded text with t.key */}
    </div>
  );
}
```

### **2. Update App.tsx:**

```typescript
case "home":
  return <HomePage 
    onNavigate={handleNavigate} 
    toggleFavourite={toggleFavourite} 
    isFavourite={isFavourite} 
    language={language}  // Add this
  />;
```

### **3. Test:**
- Click the language toggle in the Navbar
- See the HomePage text change to Arabic
- Notice the layout flip to RTL automatically

---

## 💡 Best Practices

### **1. Always Use Translation Keys**
```tsx
// ❌ Bad
<button>Submit</button>

// ✅ Good
<button>{t.submit}</button>
```

### **2. Handle Plurals Properly**
```tsx
// For dynamic content
const reviewText = count === 1 
  ? t.review 
  : t.reviews;

<span>{count} {reviewText}</span>
```

### **3. Handle Numbers and Dates**
```tsx
// Numbers in Arabic use Eastern Arabic numerals
const formatNumber = (num: number) => {
  if (language === "ar") {
    return num.toLocaleString("ar-EG");
  }
  return num.toLocaleString("en-US");
};

<p>{formatNumber(3500)} {t.perNight}</p>
```

### **4. Keep Layout Consistent**
```tsx
// Use same structure for both languages
<div className="flex items-center gap-4">
  {/* Content will auto-reverse in RTL */}
</div>
```

---

## 🧪 Testing Checklist

After implementing bilingual support on a page:

- [ ] Toggle language in Navbar
- [ ] Verify all text changes to Arabic
- [ ] Check layout flips correctly (RTL)
- [ ] Verify icons and images display correctly
- [ ] Test on mobile devices
- [ ] Check for text overflow/wrapping issues
- [ ] Verify forms work in both directions
- [ ] Test navigation between pages preserves language

---

## 🐛 Common Issues & Fixes

### **Issue: Text doesn't change**
**Fix:** Ensure you're using `t.key` not hard-coded strings

### **Issue: Layout breaks in RTL**
**Fix:** Use flexbox/grid instead of absolute positioning

### **Issue: Icons flip incorrectly**
**Fix:** Add conditional rotation classes

### **Issue: Numbers display wrong**
**Fix:** Use `toLocaleString()` with appropriate locale

---

## 📚 Additional Resources

- **Tailwind RTL Plugin**: [tailwindcss-rtl](https://github.com/20minutes/tailwindcss-rtl)
- **React i18n**: For more complex apps, consider [react-i18next](https://react.i18next.com/)
- **RTL Guidelines**: [Material Design RTL Guidelines](https://m3.material.io/foundations/layout/applying-layout/window-size-classes)

---

## 🎯 Implementation Priority

**High Priority (User-facing pages):**
1. HomePage
2. PropertiesPage
3. PropertyDetailsPage
4. LoginPage / RegisterPage

**Medium Priority (Dashboards):**
5. UserDashboard
6. HostDashboard
7. BookingConfirmationPage

**Low Priority (Info pages):**
8. AboutUsPage
9. ContactPage
10. FAQPage
11. SupportPage
12. PrivacyPolicyPage
13. TermsConditionsPage

**Special (Admin only):**
14. AdminDashboard

---

## ✅ Success Criteria

Your bilingual implementation is complete when:

1. ✅ All user-visible text uses translation keys
2. ✅ Language toggle works on every page
3. ✅ RTL layout works correctly in Arabic
4. ✅ Numbers and dates format appropriately
5. ✅ No hard-coded English text remains
6. ✅ Navigation preserves language selection
7. ✅ Forms submit correctly in both languages
8. ✅ Mobile responsive in both LTR and RTL

---

**Need Help?** 
Check the existing `Navbar.tsx` and `Footer.tsx` for reference - they're fully implemented with bilingual support and RTL handling!
