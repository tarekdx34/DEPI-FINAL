import { useState, useEffect } from "react";
import {
  CheckCircle,
  CreditCard,
  Wallet,
  Loader2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Alert, AlertDescription } from "../ui/alert";
import { Language, translations } from "../../lib/translations";
import api from "../../../api";
import type { BookingResponse, PaymentIntentResponse } from "../../../api";

interface BookingConfirmationPageProps {
  onNavigate: (page: string, propertyId?: string) => void;
  language?: Language;
}

export function BookingConfirmationPage({
  onNavigate,
  language = "en",
}: BookingConfirmationPageProps) {
  const t = translations[language]?.bookingConfirmation ||
    translations.en.bookingConfirmation || {
      title: language === "ar" ? "تأكيد الحجز والدفع" : "Confirm and Pay",
      yourTrip: language === "ar" ? "رحلتك" : "Your Trip",
      dates: language === "ar" ? "التواريخ" : "Dates",
      guests: language === "ar" ? "الضيوف" : "Guests",
      edit: language === "ar" ? "تعديل" : "Edit",
      paymentMethod: language === "ar" ? "طريقة الدفع" : "Payment Method",
      creditCard:
        language === "ar" ? "بطاقة ائتمان / خصم" : "Credit / Debit Card",
      fawry: language === "ar" ? "فوري" : "Fawry",
      cardNumber: language === "ar" ? "رقم البطاقة" : "Card Number",
      expiryDate: language === "ar" ? "تاريخ الانتهاء" : "Expiry Date",
      cvv: language === "ar" ? "CVV" : "CVV",
      customerName:
        language === "ar" ? "الاسم كما يظهر على البطاقة" : "Name on Card",
      customerEmail: language === "ar" ? "البريد الإلكتروني" : "Email Address",
      customerPhone: language === "ar" ? "رقم الهاتف" : "Phone Number",
      cancellationPolicy:
        language === "ar" ? "سياسة الإلغاء" : "Cancellation Policy",
      priceDetails: language === "ar" ? "تفاصيل السعر" : "Price Details",
      nights: language === "ar" ? "ليالي" : "nights",
      serviceFee: language === "ar" ? "رسوم الخدمة" : "Service fee",
      cleaningFee: language === "ar" ? "رسوم التنظيف" : "Cleaning fee",
      total: language === "ar" ? "الإجمالي" : "Total",
      confirmAndPay: language === "ar" ? "تأكيد والدفع" : "Confirm and Pay",
      bookingConfirmed:
        language === "ar" ? "تم تأكيد الحجز!" : "Booking Confirmed!",
      confirmationMessage:
        language === "ar"
          ? "تم تأكيد حجزك بنجاح. سوف تتلقى بريد إلكتروني تأكيدي قريباً."
          : "Your reservation has been successfully confirmed. You'll receive a confirmation email shortly.",
      confirmationCode: language === "ar" ? "رمز التأكيد" : "Confirmation Code",
      viewTrips: language === "ar" ? "عرض رحلاتي" : "View My Trips",
      backToHome: language === "ar" ? "العودة للرئيسية" : "Back to Home",
      processing: language === "ar" ? "جاري المعالجة..." : "Processing...",
      paymentInstructions:
        language === "ar"
          ? "سيتم توجيهك إلى صفحة الدفع لإتمام العملية"
          : "You will be redirected to complete the payment",
    };

  // State
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [paymentIntent, setPaymentIntent] =
    useState<PaymentIntentResponse | null>(null);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  // Load booking data from localStorage (set by PropertyDetailsPage)
  useEffect(() => {
    loadBookingData();
  }, []);

  const loadBookingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get booking ID from localStorage
      const pendingBookingId = localStorage.getItem("pendingBookingId");

      if (!pendingBookingId) {
        setError(
          language === "ar"
            ? "لم يتم العثور على معلومات الحجز"
            : "No booking information found"
        );
        return;
      }

      // Fetch booking details
      const bookingData = await api.getBooking(parseInt(pendingBookingId));
      setBooking(bookingData);

      // Load user profile for pre-filling form
      try {
        const profile = await api.getProfile();
        setCustomerName(`${profile.firstName} ${profile.lastName}`);
        setCustomerEmail(profile.email);
        setCustomerPhone(profile.phoneNumber || "");
      } catch (err) {
        console.log("Could not load user profile:", err);
      }
    } catch (err: any) {
      console.error("Error loading booking:", err);
      setError(
        err.message ||
          (language === "ar"
            ? "فشل تحميل معلومات الحجز"
            : "Failed to load booking information")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!booking) return;

    // Validate form
    if (!customerName || !customerEmail || !customerPhone) {
      alert(
        language === "ar"
          ? "يرجى ملء جميع الحقول المطلوبة"
          : "Please fill in all required fields"
      );
      return;
    }

    if (paymentMethod === "card") {
      if (!cardNumber || !expiryDate || !cvv) {
        alert(
          language === "ar"
            ? "يرجى إدخال معلومات البطاقة كاملة"
            : "Please enter complete card information"
        );
        return;
      }
    }

    try {
      setProcessing(true);
      setError(null);

      // ✅ FIX: Map frontend payment method to backend enum values
      const backendPaymentMethod =
        paymentMethod === "card" ? "credit_card" : "fawry";

      // Create payment intent
      const paymentData = {
        bookingId: booking.bookingId,
        paymentMethod: backendPaymentMethod, // ⬅️ Fixed mapping
        customerName,
        customerEmail,
        customerPhone,
      };

      console.log("💳 Creating payment intent:", paymentData);

      const intent = await api.createPaymentIntent(paymentData);
      setPaymentIntent(intent);

      console.log("✅ Payment intent created:", intent);

      // For Fawry, show payment instructions
      if (paymentMethod === "fawry") {
        // In production, you would redirect to Fawry payment page
        // For now, we'll simulate it
        alert(
          language === "ar"
            ? `رمز الدفع فوري: ${intent.fawryReferenceNumber}\nيرجى الدفع من خلال أقرب نقطة فوري`
            : `Fawry Reference: ${intent.fawryReferenceNumber}\nPlease pay at any Fawry location`
        );
      }

      // Simulate payment confirmation (in production, this would be a webhook)
      // For demo purposes, we'll confirm immediately
      console.log("💳 Confirming payment...");

      const confirmPayment = await api.confirmPayment({
        transactionReference: intent.transactionReference,
        simulateSuccess: true,
      });

      console.log("✅ Payment confirmed:", confirmPayment);

      // Clear pending booking
      localStorage.removeItem("pendingBookingId");
      localStorage.removeItem("bookingIntent");

      setConfirmed(true);
    } catch (err: any) {
      console.error("❌ Payment error:", err);
      setError(
        err.message ||
          (language === "ar"
            ? "فشل إتمام عملية الدفع. يرجى المحاولة مرة أخرى."
            : "Payment failed. Please try again.")
      );
    } finally {
      setProcessing(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#00BFA6] mx-auto mb-4" />
          <p className="text-gray-600">
            {language === "ar" ? "جاري التحميل..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !booking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#2B2B2B] mb-2">
            {language === "ar" ? "حدث خطأ" : "Error"}
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => onNavigate("properties")}
            className="bg-[#00BFA6] hover:bg-[#00A890]"
          >
            {language === "ar" ? "تصفح العقارات" : "Browse Properties"}
          </Button>
        </Card>
      </div>
    );
  }

  // Success state
  if (confirmed && booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F6F1] p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-semibold text-[#2B2B2B] mb-2">
            {t.bookingConfirmed}
          </h2>
          <p className="text-gray-600 mb-6">{t.confirmationMessage}</p>
          <div className="bg-[#F9F6F1] rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">{t.confirmationCode}</p>
            <p className="text-2xl font-semibold text-[#00BFA6]">
              {booking.bookingReference}
            </p>
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => onNavigate("user-dashboard")}
              className="w-full bg-[#00BFA6] hover:bg-[#00A890] text-white"
            >
              {t.viewTrips}
            </Button>
            <Button
              onClick={() => onNavigate("home")}
              variant="ghost"
              className="w-full"
            >
              {t.backToHome}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!booking) return null;

  const propertyTitle =
    language === "ar" ? booking.property.titleAr : booking.property.titleEn;

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() =>
            onNavigate(
              "property-details",
              booking.property.propertyId.toString()
            )
          }
          className="mb-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === "ar" ? "رجوع" : "Back"}
        </Button>

        <h1 className="text-3xl font-semibold text-[#2B2B2B] mb-8">
          {t.title}
        </h1>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Details */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-[#2B2B2B] mb-4">
                {t.yourTrip}
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{t.dates}</p>
                    <p className="text-gray-600">
                      {new Date(booking.checkInDate).toLocaleDateString(
                        language === "ar" ? "ar-EG" : "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}{" "}
                      -{" "}
                      {new Date(booking.checkOutDate).toLocaleDateString(
                        language === "ar" ? "ar-EG" : "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{t.guests}</p>
                    <p className="text-gray-600">
                      {booking.numberOfGuests}{" "}
                      {language === "ar" ? "ضيف" : "guests"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Customer Information */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-[#2B2B2B] mb-4">
                {language === "ar" ? "معلومات الاتصال" : "Contact Information"}
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerName">{t.customerName}</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={
                      language === "ar" ? "الاسم الكامل" : "Full Name"
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">{t.customerEmail}</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">{t.customerPhone}</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+20 123 456 7890"
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-[#2B2B2B] mb-4">
                {t.paymentMethod}
              </h2>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="card" id="card" />
                    <Label
                      htmlFor="card"
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>{t.creditCard}</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="fawry" id="fawry" />
                    <Label
                      htmlFor="fawry"
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <Wallet className="w-5 h-5" />
                      <span>{t.fawry}</span>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {paymentMethod === "card" && (
                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">{t.cardNumber}</Label>
                    <Input
                      id="cardNumber"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="mt-1"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">{t.expiryDate}</Label>
                      <Input
                        id="expiry"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        placeholder="MM/YY"
                        className="mt-1"
                        maxLength={5}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">{t.cvv}</Label>
                      <Input
                        id="cvv"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        type="password"
                        className="mt-1"
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "fawry" && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    {t.paymentInstructions}
                  </p>
                </div>
              )}
            </Card>

            {/* Cancellation Policy */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-[#2B2B2B] mb-4">
                {t.cancellationPolicy}
              </h2>
              <p className="text-gray-700">
                {language === "ar"
                  ? "إلغاء مجاني قبل 7 أيام من تاريخ تسجيل الوصول. للحصول على استرداد جزئي، قم بالإلغاء قبل 48 ساعة من تسجيل الوصول."
                  : "Free cancellation 7 days before check-in. For a partial refund, cancel 48 hours before check-in."}
              </p>
            </Card>
          </div>

          {/* Right Column - Price Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-28">
              <div className="flex gap-4 mb-6">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={
                      booking.property.propertyId
                        ? `https://images.unsplash.com/photo-1729720281771-b790dfb6ec7f`
                        : ""
                    }
                    alt={propertyTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#2B2B2B] line-clamp-2">
                    {propertyTitle}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {booking.property.city}, {booking.property.governorate}
                  </p>
                </div>
              </div>

              <Separator className="my-4" />

              <h3 className="font-semibold text-[#2B2B2B] mb-4">
                {t.priceDetails}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">
                    {booking.pricePerNight.toLocaleString()} EGP ×{" "}
                    {booking.numberOfNights} {t.nights}
                  </span>
                  <span>{booking.subtotal.toLocaleString()} EGP</span>
                </div>
                {booking.cleaningFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">{t.cleaningFee}</span>
                    <span>{booking.cleaningFee.toLocaleString()} EGP</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-700">{t.serviceFee}</span>
                  <span>{booking.serviceFee.toLocaleString()} EGP</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-semibold text-lg mb-6">
                <span>{t.total} (EGP)</span>
                <span>{booking.totalPrice.toLocaleString()} EGP</span>
              </div>

              <Button
                onClick={handleConfirm}
                disabled={processing}
                className="w-full h-12 bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.processing}
                  </>
                ) : (
                  t.confirmAndPay
                )}
              </Button>

              <p className="text-xs text-gray-600 text-center mt-4">
                {language === "ar"
                  ? "بالضغط على الزر أدناه، أوافق على قواعد المضيف وشروط أجارلي وسياسة الاسترداد."
                  : "By selecting the button, I agree to the Host's House Rules and Ajarly's Rebooking and Refund Policy."}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
