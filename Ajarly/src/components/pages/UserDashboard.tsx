import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner@2.0.3";

interface UserDashboardProps {
  onNavigate: (page: string, propertyId?: string) => void;
}

export function UserDashboard({ onNavigate }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState("trips");
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; tripId: string | null; propertyName: string }>({
    open: false,
    tripId: null,
    propertyName: "",
  });
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");

  const upcomingTrips = [
    {
      id: "1",
      property: "Luxury Beachfront Villa",
      location: "North Coast, Egypt",
      image: "https://images.unsplash.com/photo-1729720281771-b790dfb6ec7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWFjaCUyMHZpbGxhfGVufDF8fHx8MTc2MTA5ODc1Nnww&ixlib=rb-4.1.0&q=80&w=1080",
      checkIn: "Dec 24, 2025",
      checkOut: "Dec 28, 2025",
      confirmationCode: "AJR-2025-8472",
      guests: 4,
      totalPrice: 14000,
    },
  ];

  const pastTrips = [
    {
      id: "2",
      property: "Cozy Beach Apartment",
      location: "Alexandria, Egypt",
      image: "https://images.unsplash.com/photo-1635690280190-0eec6bc587fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGhvdXNlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYxMTYxMzgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      checkIn: "Aug 15, 2025",
      checkOut: "Aug 20, 2025",
      confirmationCode: "AJR-2025-6283",
      totalPrice: 9000,
      reviewed: true,
    },
    {
      id: "3",
      property: "Seaside Chalet",
      location: "Matrouh, Egypt",
      image: "https://images.unsplash.com/photo-1598635031829-4bfae29d33eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGVycmFuZWFuJTIwdmlsbGF8ZW58MXx8fHwxNzYxMTI5ODA1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      checkIn: "Jun 10, 2025",
      checkOut: "Jun 15, 2025",
      confirmationCode: "AJR-2025-4521",
      totalPrice: 11500,
      reviewed: false,
    },
  ];

  const favorites = [
    {
      id: "1",
      title: "Mediterranean Villa with Pool",
      location: "Alexandria, Egypt",
      price: 2800,
      image: "https://images.unsplash.com/photo-1598635031829-4bfae29d33eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGVycmFuZWFuJTIwdmlsbGF8ZW58MXx8fHwxNzYxMTI5ODA1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.8,
    },
    {
      id: "2",
      title: "Cozy Beach House",
      location: "Matrouh, Egypt",
      price: 1800,
      image: "https://images.unsplash.com/photo-1635690280190-0eec6bc587fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGhvdXNlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYxMTYxMzgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      rating: 4.7,
    },
  ];

  const paymentHistory = [
    {
      id: "1",
      date: "Oct 15, 2025",
      property: "Luxury Beachfront Villa",
      amount: 14000,
      status: "Completed",
      confirmationCode: "AJR-2025-8472",
    },
    {
      id: "2",
      date: "Aug 10, 2025",
      property: "Cozy Beach Apartment",
      amount: 9000,
      status: "Completed",
      confirmationCode: "AJR-2025-6283",
    },
    {
      id: "3",
      date: "Jun 05, 2025",
      property: "Seaside Chalet",
      amount: 11500,
      status: "Completed",
      confirmationCode: "AJR-2025-4521",
    },
  ];

  const reviewsGiven = [
    {
      id: "1",
      property: "Cozy Beach Apartment",
      location: "Alexandria, Egypt",
      rating: 5,
      comment: "Amazing place! The view was breathtaking and the host was very accommodating. Highly recommend!",
      date: "Aug 22, 2025",
      image: "https://images.unsplash.com/photo-1635690280190-0eec6bc587fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGhvdXNlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYxMTYxMzgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F9F6F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold text-[#2B2B2B] mb-8">My Account</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-3xl grid-cols-5 mb-8">
            <TabsTrigger value="trips" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Trips</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Trips Tab */}
          <TabsContent value="trips" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">Upcoming Trips</h2>
              {upcomingTrips.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {upcomingTrips.map((trip) => (
                    <Card key={trip.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row gap-4 p-6">
                        <div className="w-full md:w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={trip.image}
                            alt={trip.property}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="text-xl font-semibold text-[#2B2B2B] mb-1">
                              {trip.property}
                            </h3>
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{trip.location}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-600" />
                              <span>
                                {trip.checkIn} - {trip.checkOut}
                              </span>
                            </div>
                            <Badge variant="outline" className="gap-1">
                              <Clock className="w-3 h-3" />
                              Confirmed
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Guests: {trip.guests}</p>
                            <p>Total: <span className="font-semibold text-[#00BFA6]">{trip.totalPrice} EGP</span></p>
                            <p className="mt-1">Confirmation Code: <span className="font-semibold text-[#00BFA6]">{trip.confirmationCode}</span></p>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              Contact Host
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => setCancelBookingId(trip.id)}
                            >
                              Cancel Booking
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">No trips yet</h3>
                  <p className="text-gray-600 mb-4">Time to dust off your bags and start planning your next adventure!</p>
                  <Button onClick={() => onNavigate("properties")} className="bg-[#00BFA6] hover:bg-[#00A890]">
                    Start Exploring
                  </Button>
                </Card>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">Past Trips</h2>
              {pastTrips.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {pastTrips.map((trip) => (
                    <Card key={trip.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row gap-4 p-6">
                        <div className="w-full md:w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={trip.image}
                            alt={trip.property}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h3 className="text-xl font-semibold text-[#2B2B2B] mb-1">
                              {trip.property}
                            </h3>
                            <div className="flex items-center gap-1 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{trip.location}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-600" />
                              <span>
                                {trip.checkIn} - {trip.checkOut}
                              </span>
                            </div>
                            <Badge variant="outline" className="gap-1 bg-gray-100">
                              <Clock className="w-3 h-3" />
                              Completed
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Total Paid: <span className="font-semibold">{trip.totalPrice} EGP</span></p>
                            <p className="mt-1">Confirmation: {trip.confirmationCode}</p>
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                            {!trip.reviewed && (
                              <Button
                                size="sm"
                                className="bg-[#00BFA6] hover:bg-[#00A890]"
                                onClick={() =>
                                  setReviewDialog({
                                    open: true,
                                    tripId: trip.id,
                                    propertyName: trip.property,
                                  })
                                }
                              >
                                Write Review
                              </Button>
                            )}
                            {trip.reviewed && (
                              <Badge variant="outline" className="gap-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                Reviewed
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-gray-600">No past trips</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">My Favorites</h2>
            {favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((property) => (
                  <Card
                    key={property.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => onNavigate("property-details", property.id)}
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <ImageWithFallback
                        src={property.image}
                        alt={property.title}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-[#2B2B2B] mb-1">{property.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{property.location}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{property.price} EGP / night</span>
                        <span className="text-sm">★ {property.rating}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">No favorites yet</h3>
                <p className="text-gray-600 mb-4">Save properties you love to easily find them later</p>
                <Button onClick={() => onNavigate("properties")} className="bg-[#00BFA6] hover:bg-[#00A890]">
                  Browse Properties
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">Reviews Given</h2>
              {reviewsGiven.length > 0 ? (
                <div className="space-y-4">
                  {reviewsGiven.map((review) => (
                    <Card key={review.id} className="p-6">
                      <div className="flex gap-4">
                        <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={review.image}
                            alt={review.property}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-[#2B2B2B]">{review.property}</h3>
                              <p className="text-sm text-gray-600">{review.location}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "fill-gray-200 text-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                          <p className="text-xs text-gray-500">{review.date}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">No reviews yet</h3>
                  <p className="text-gray-600">Share your experiences after completing a trip</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">Payment History</h2>
              {paymentHistory.length > 0 ? (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Confirmation Code</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentHistory.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.date}</TableCell>
                          <TableCell className="font-medium">{payment.property}</TableCell>
                          <TableCell className="text-[#00BFA6]">{payment.confirmationCode}</TableCell>
                          <TableCell className="font-semibold">{payment.amount} EGP</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              {payment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <Card className="p-12 text-center">
                  <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">No payment history</h3>
                  <p className="text-gray-600">Your completed transactions will appear here</p>
                </Card>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">Payment Methods</h2>
              <Card className="p-6 max-w-2xl">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-gray-600" />
                      <div>
                        <p className="font-medium">Visa •••• 4242</p>
                        <p className="text-sm text-gray-600">Expires 12/26</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">Remove</Button>
                  </div>
                </div>
                <Button variant="outline" className="mt-4">+ Add Payment Method</Button>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="p-6 max-w-2xl">
              <div className="flex items-center gap-6 mb-8">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-[#00BFA6] text-white text-2xl">AH</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-semibold text-[#2B2B2B]">Ahmed Hassan</h2>
                  <p className="text-gray-600">Member since 2025</p>
                </div>
              </div>

              <form className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue="Ahmed Hassan" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="ahmed@example.com" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+20 123 456 7890" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="bio">About</Label>
                  <Textarea id="bio" placeholder="Tell us about yourself" className="mt-1" rows={3} />
                </div>
                <div>
                  <Label htmlFor="password">New Password</Label>
                  <Input id="password" type="password" placeholder="Leave blank to keep current password" className="mt-1" />
                </div>
                <Button className="bg-[#00BFA6] hover:bg-[#00A890]">Save Changes</Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Cancel Booking Dialog */}
        <AlertDialog open={cancelBookingId !== null} onOpenChange={() => setCancelBookingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will cancel your booking and you will not be able to recover it.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  // Add logic to cancel the booking
                  toast.success("Booking canceled successfully!");
                  setCancelBookingId(null);
                }}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Write Review Dialog */}
        <Dialog open={reviewDialog.open} onOpenChange={() => setReviewDialog({ open: false, tripId: null, propertyName: "" })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
              <DialogDescription>
                Share your experience with {reviewDialog.propertyName}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < reviewRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                    onClick={() => setReviewRating(i + 1)}
                  />
                ))}
              </div>
              <Textarea
                id="reviewComment"
                placeholder="Write your review here"
                className="mt-1"
                rows={3}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewDialog({ open: false, tripId: null, propertyName: "" })}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-[#00BFA6] hover:bg-[#00A890]"
                onClick={() => {
                  // Add logic to submit the review
                  toast.success("Review submitted successfully!");
                  setReviewDialog({ open: false, tripId: null, propertyName: "" });
                }}
              >
                Submit Review
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}