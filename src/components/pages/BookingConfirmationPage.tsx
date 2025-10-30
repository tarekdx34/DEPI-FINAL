import { useState } from "react";
import { CheckCircle, CreditCard, Wallet } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface BookingConfirmationPageProps {
  onNavigate: (page: string) => void;
}

export function BookingConfirmationPage({ onNavigate }: BookingConfirmationPageProps) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      onNavigate("user-dashboard");
    }, 3000);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F6F1] p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-semibold text-[#2B2B2B] mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your reservation has been successfully confirmed. You'll receive a confirmation email shortly.
          </p>
          <div className="bg-[#F9F6F1] rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Confirmation Code</p>
            <p className="text-2xl font-semibold text-[#00BFA6]">AJR-2025-8472</p>
          </div>
          <Button
            onClick={() => onNavigate("user-dashboard")}
            className="w-full bg-[#00BFA6] hover:bg-[#00A890] text-white"
          >
            View My Trips
          </Button>
          <Button
            onClick={() => onNavigate("home")}
            variant="ghost"
            className="w-full mt-2"
          >
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-[#2B2B2B] mb-8">Confirm and Pay</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Payment Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Details */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-[#2B2B2B] mb-4">Your Trip</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Dates</p>
                    <p className="text-gray-600">Dec 24 - Dec 28, 2025</p>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Guests</p>
                    <p className="text-gray-600">4 guests</p>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-[#2B2B2B] mb-4">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="w-5 h-5" />
                      <span>Credit / Debit Card</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="fawry" id="fawry" />
                    <Label htmlFor="fawry" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Wallet className="w-5 h-5" />
                      <span>Fawry</span>
                    </Label>
                  </div>
                </div>
              </RadioGroup>

              {paymentMethod === "card" && (
                <div className="mt-6 space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" placeholder="MM/YY" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="123" type="password" className="mt-1" />
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Cancellation Policy */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-[#2B2B2B] mb-4">Cancellation Policy</h2>
              <p className="text-gray-700">
                Free cancellation before Dec 17. Cancel before check-in on Dec 24 for a partial refund.{" "}
                <a href="#" className="text-[#00BFA6] hover:underline">
                  Learn more
                </a>
              </p>
            </Card>
          </div>

          {/* Right Column - Price Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-28">
              <div className="flex gap-4 mb-6">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1729720281771-b790dfb6ec7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWFjaCUyMHZpbGxhfGVufDF8fHx8MTc2MTA5ODc1Nnww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Property"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#2B2B2B] line-clamp-2">
                    Luxury Beachfront Villa
                  </h3>
                  <p className="text-sm text-gray-600">North Coast, Egypt</p>
                </div>
              </div>

              <Separator className="my-4" />

              <h3 className="font-semibold text-[#2B2B2B] mb-4">Price Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">3,500 EGP × 4 nights</span>
                  <span>14,000 EGP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Service fee</span>
                  <span>1,400 EGP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Taxes</span>
                  <span>700 EGP</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between font-semibold text-lg mb-6">
                <span>Total (EGP)</span>
                <span>16,100 EGP</span>
              </div>

              <Button
                onClick={handleConfirm}
                className="w-full h-12 bg-[#FF6B6B] hover:bg-[#FF5252] text-white"
                size="lg"
              >
                Confirm and Pay
              </Button>

              <p className="text-xs text-gray-600 text-center mt-4">
                By selecting the button below, I agree to the Host's House Rules, Ground rules for
                guests, and Ajarly's Rebooking and Refund Policy.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
