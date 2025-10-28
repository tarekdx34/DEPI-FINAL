package com.ajarly.backend.service;

import com.ajarly.backend.dto.*;
import com.ajarly.backend.exception.ResourceNotFoundException;
import com.ajarly.backend.model.*;
import com.ajarly.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {
    
    private final AnalyticsRepository analyticsRepository;
    private final PropertyRepository propertyRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    
    @Transactional(readOnly = true)
    public PropertyAnalyticsResponse getPropertyPerformance(Long propertyId, LocalDate startDate, LocalDate endDate) {
        Property property = propertyRepository.findById(propertyId)
            .orElseThrow(() -> new ResourceNotFoundException("Property not found"));
        List<PropertyPerformanceAnalytics> analytics = analyticsRepository.findByPropertyAndDateRange(propertyId, startDate, endDate);
        return PropertyAnalyticsResponse.builder()
            .propertyId(propertyId).propertyTitle(property.getTitleAr()).startDate(startDate).endDate(endDate)
            .summary(buildSummaryMetrics(analytics)).viewsOverTime(buildViewsChart(analytics))
            .bookingsOverTime(buildBookingsChart(analytics)).revenueOverTime(buildRevenueChart(analytics))
            .ratingTrend(buildRatingChart(analytics)).performance(buildPerformanceIndicators(propertyId, analytics, startDate, endDate))
            .build();
    }
    
    @Transactional(readOnly = true)
    public OwnerDashboardResponse getOwnerDashboard(Long ownerId) {
        User owner = userRepository.findById(ownerId).orElseThrow(() -> new ResourceNotFoundException("Owner not found"));
        List<Property> properties = propertyRepository.findByOwner_UserId(ownerId, Pageable.unpaged()).getContent();
        return OwnerDashboardResponse.builder()
            .ownerId(ownerId).ownerName(owner.getFirstName() + " " + owner.getLastName())
            .overview(buildOwnerOverview(ownerId, properties)).bestPerformingProperty(findBestPerformingProperty(properties))
            .upcomingBookings(getUpcomingBookingsForOwner(ownerId)).recentReviews(getRecentReviewsForOwner(properties))
            .revenueChart(getOwnerRevenueChart(ownerId)).propertiesPerformance(getPropertiesPerformance(properties))
            .build();
    }
    
    @Transactional(readOnly = true)
    public PlatformAnalyticsResponse getPlatformAnalytics(LocalDate startDate, LocalDate endDate) {
        return PlatformAnalyticsResponse.builder()
            .startDate(startDate).endDate(endDate).overview(buildPlatformOverview(startDate, endDate))
            .userGrowth(getUserGrowthChart(startDate, endDate)).propertyGrowth(getPropertyGrowthChart(startDate, endDate))
            .bookingGrowth(getBookingGrowthChart(startDate, endDate)).revenueGrowth(getRevenueGrowthChart(startDate, endDate))
            .topLocations(getTopLocations()).popularPropertyTypes(getPropertyTypeStats())
            .userStats(buildUserStats(startDate, endDate)).bookingStats(buildBookingStats())
            .build();
    }
    
    private PropertyAnalyticsResponse.SummaryMetrics buildSummaryMetrics(List<PropertyPerformanceAnalytics> analytics) {
        return PropertyAnalyticsResponse.SummaryMetrics.builder()
            .totalViews(analytics.stream().mapToInt(PropertyPerformanceAnalytics::getTotalViews).sum())
            .uniqueViews(analytics.stream().mapToInt(PropertyPerformanceAnalytics::getUniqueViews).sum())
            .totalBookingRequests(analytics.stream().mapToInt(PropertyPerformanceAnalytics::getBookingRequests).sum())
            .totalConfirmedBookings(analytics.stream().mapToInt(PropertyPerformanceAnalytics::getBookingConfirmations).sum())
            .totalCancellations(analytics.stream().mapToInt(PropertyPerformanceAnalytics::getBookingCancellations).sum())
            .totalRevenue(analytics.stream().map(PropertyPerformanceAnalytics::getRevenue).reduce(BigDecimal.ZERO, BigDecimal::add))
            .averageRating(analytics.isEmpty() ? BigDecimal.ZERO : analytics.stream().map(PropertyPerformanceAnalytics::getAverageRating)
                .filter(r -> r.compareTo(BigDecimal.ZERO) > 0).reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(analytics.size()), 2, RoundingMode.HALF_UP))
            .totalReviews(analytics.stream().mapToInt(PropertyPerformanceAnalytics::getNewReviews).sum())
            .contactClicks(analytics.stream().mapToInt(PropertyPerformanceAnalytics::getContactClicks).sum())
            .build();
    }
    
    private List<PropertyAnalyticsResponse.DailyMetric> buildViewsChart(List<PropertyPerformanceAnalytics> analytics) {
        return analytics.stream().map(a -> PropertyAnalyticsResponse.DailyMetric.builder()
            .date(a.getAnalyticsDate()).value(a.getTotalViews()).label(a.getAnalyticsDate().toString()).build())
            .collect(Collectors.toList());
    }
    
    private List<PropertyAnalyticsResponse.DailyMetric> buildBookingsChart(List<PropertyPerformanceAnalytics> analytics) {
        return analytics.stream().map(a -> PropertyAnalyticsResponse.DailyMetric.builder()
            .date(a.getAnalyticsDate()).value(a.getBookingConfirmations()).label(a.getAnalyticsDate().toString()).build())
            .collect(Collectors.toList());
    }
    
    private List<PropertyAnalyticsResponse.DailyMetric> buildRevenueChart(List<PropertyPerformanceAnalytics> analytics) {
        return analytics.stream().map(a -> PropertyAnalyticsResponse.DailyMetric.builder()
            .date(a.getAnalyticsDate()).value(a.getRevenue()).label(a.getAnalyticsDate().toString()).build())
            .collect(Collectors.toList());
    }
    
    private List<PropertyAnalyticsResponse.DailyMetric> buildRatingChart(List<PropertyPerformanceAnalytics> analytics) {
        return analytics.stream().filter(a -> a.getAverageRating().compareTo(BigDecimal.ZERO) > 0)
            .map(a -> PropertyAnalyticsResponse.DailyMetric.builder()
                .date(a.getAnalyticsDate()).value(a.getAverageRating()).label(a.getAnalyticsDate().toString()).build())
            .collect(Collectors.toList());
    }
    
    private PropertyAnalyticsResponse.PerformanceIndicators buildPerformanceIndicators(
            Long propertyId, List<PropertyPerformanceAnalytics> analytics, LocalDate startDate, LocalDate endDate) {
        int totalRequests = analytics.stream().mapToInt(PropertyPerformanceAnalytics::getBookingRequests).sum();
        int totalConfirmed = analytics.stream().mapToInt(PropertyPerformanceAnalytics::getBookingConfirmations).sum();
        int totalViews = analytics.stream().mapToInt(PropertyPerformanceAnalytics::getTotalViews).sum();
        BigDecimal totalRevenue = analytics.stream().map(PropertyPerformanceAnalytics::getRevenue).reduce(BigDecimal.ZERO, BigDecimal::add);
        return PropertyAnalyticsResponse.PerformanceIndicators.builder()
            .bookingConversionRate(totalRequests > 0 ? BigDecimal.valueOf(totalConfirmed)
                .divide(BigDecimal.valueOf(totalRequests), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)) : BigDecimal.ZERO)
            .viewToBookingRate(totalViews > 0 ? BigDecimal.valueOf(totalRequests)
                .divide(BigDecimal.valueOf(totalViews), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)) : BigDecimal.ZERO)
            .averageRevenuePerBooking(totalConfirmed > 0 ? totalRevenue.divide(BigDecimal.valueOf(totalConfirmed), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO)
            .occupancyRate(startDate.datesUntil(endDate.plusDays(1)).count() > 0 ? BigDecimal.valueOf(totalConfirmed)
                .divide(BigDecimal.valueOf(startDate.datesUntil(endDate.plusDays(1)).count()), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)) : BigDecimal.ZERO)
            .avgResponseTimeHours(24).build();
    }
    
    private OwnerDashboardResponse.OverviewStats buildOwnerOverview(Long ownerId, List<Property> properties) {
        List<Booking> allBookings = bookingRepository.findByOwnerUserIdOrderByRequestedAtDesc(ownerId);
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<Long> propertyIds = properties.stream().map(Property::getPropertyId).collect(Collectors.toList());
        int totalReviews = 0;
        BigDecimal totalRating = BigDecimal.ZERO;
        int ratedCount = 0;
        for (Long propertyId : propertyIds) {
            totalReviews += reviewRepository.countApprovedByPropertyId(propertyId).intValue();
            reviewRepository.getAverageRatingByPropertyId(propertyId).ifPresent(r -> {});
        }
        return OwnerDashboardResponse.OverviewStats.builder()
            .totalProperties(properties.size())
            .activeProperties((int) properties.stream().filter(p -> p.getStatus() == Property.PropertyStatus.active).count())
            .pendingApprovalProperties((int) properties.stream().filter(p -> p.getStatus() == Property.PropertyStatus.pending_approval).count())
            .totalRevenue(allBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.confirmed || 
                b.getStatus() == Booking.BookingStatus.completed).map(Booking::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add))
            .monthlyRevenue(allBookings.stream().filter(b -> (b.getStatus() == Booking.BookingStatus.confirmed || 
                b.getStatus() == Booking.BookingStatus.completed) && b.getRequestedAt().toLocalDate().isAfter(thirtyDaysAgo))
                .map(Booking::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add))
            .totalBookings(allBookings.size())
            .pendingBookings((int) allBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.pending).count())
            .upcomingBookings(bookingRepository.findUpcomingBookingsForOwner(ownerId, LocalDate.now()).size())
            .averageRating(BigDecimal.ZERO).totalReviews(totalReviews).build();
    }
    
    private OwnerDashboardResponse.BestProperty findBestPerformingProperty(List<Property> properties) {
        if (properties.isEmpty()) return null;
        Property bestProperty = properties.get(0);
        BigDecimal maxRevenue = BigDecimal.ZERO;
        for (Property property : properties) {
            BigDecimal propertyRevenue = bookingRepository.findByPropertyPropertyIdOrderByRequestedAtDesc(property.getPropertyId())
                .stream().filter(b -> b.getStatus() == Booking.BookingStatus.confirmed || 
                b.getStatus() == Booking.BookingStatus.completed).map(Booking::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
            if (propertyRevenue.compareTo(maxRevenue) > 0) {
                maxRevenue = propertyRevenue;
                bestProperty = property;
            }
        }
        List<Booking> bestBookings = bookingRepository.findByPropertyPropertyIdOrderByRequestedAtDesc(bestProperty.getPropertyId());
        return OwnerDashboardResponse.BestProperty.builder()
            .propertyId(bestProperty.getPropertyId()).propertyTitle(bestProperty.getTitleAr())
            .propertyImage(bestProperty.getImages().isEmpty() ? null : bestProperty.getImages().get(0).getImageUrl())
            .totalRevenue(maxRevenue)
            .totalBookings((int) bestBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.confirmed || 
                b.getStatus() == Booking.BookingStatus.completed).count())
            .averageRating(bestProperty.getAverageRating()).totalViews(bestProperty.getViewCount())
            .performanceReason("Highest Revenue").build();
    }
    
    private List<OwnerDashboardResponse.UpcomingBooking> getUpcomingBookingsForOwner(Long ownerId) {
        return bookingRepository.findUpcomingBookingsForOwner(ownerId, LocalDate.now()).stream().limit(10)
            .map(b -> OwnerDashboardResponse.UpcomingBooking.builder()
                .bookingId(b.getBookingId()).bookingReference(b.getBookingReference())
                .propertyId(b.getProperty().getPropertyId()).propertyTitle(b.getProperty().getTitleAr())
                .renterName(b.getRenter().getFirstName() + " " + b.getRenter().getLastName())
                .checkInDate(b.getCheckInDate()).checkOutDate(b.getCheckOutDate())
                .numberOfGuests(b.getNumberOfGuests()).totalPrice(b.getTotalPrice())
                .status(b.getStatus().name()).build())
            .collect(Collectors.toList());
    }
    
    private List<OwnerDashboardResponse.RecentReview> getRecentReviewsForOwner(List<Property> properties) {
        List<OwnerDashboardResponse.RecentReview> reviews = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        for (Property property : properties) {
            reviewRepository.findByPropertyIdAndApproved(property.getPropertyId(), Pageable.unpaged()).getContent()
                .forEach(review -> reviews.add(OwnerDashboardResponse.RecentReview.builder()
                    .reviewId(review.getReviewId()).propertyId(property.getPropertyId())
                    .propertyTitle(property.getTitleAr())
                    .reviewerName(review.getReviewer().getFirstName() + " " + review.getReviewer().getLastName())
                    .rating(review.getOverallRating()).reviewText(review.getReviewText())
                    .reviewDate(review.getCreatedAt().format(formatter))
                    .hasResponse(review.getOwnerResponse() != null).build()));
        }
        return reviews.stream().sorted((r1, r2) -> r2.getReviewDate().compareTo(r1.getReviewDate()))
            .limit(10).collect(Collectors.toList());
    }
    
    private List<OwnerDashboardResponse.RevenueData> getOwnerRevenueChart(Long ownerId) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);
        Map<LocalDate, List<PropertyPerformanceAnalytics>> grouped = analyticsRepository
            .findByOwnerAndDateRange(ownerId, startDate, endDate).stream()
            .collect(Collectors.groupingBy(PropertyPerformanceAnalytics::getAnalyticsDate));
        return grouped.entrySet().stream()
            .map(entry -> OwnerDashboardResponse.RevenueData.builder()
                .date(entry.getKey())
                .revenue(entry.getValue().stream().map(PropertyPerformanceAnalytics::getRevenue).reduce(BigDecimal.ZERO, BigDecimal::add))
                .bookings(entry.getValue().stream().mapToInt(PropertyPerformanceAnalytics::getBookingConfirmations).sum())
                .build())
            .sorted((a, b) -> a.getDate().compareTo(b.getDate())).collect(Collectors.toList());
    }
    
    private List<OwnerDashboardResponse.PropertyPerformance> getPropertiesPerformance(List<Property> properties) {
        return properties.stream().map(property -> {
            List<Booking> bookings = bookingRepository.findByPropertyPropertyIdOrderByRequestedAtDesc(property.getPropertyId());
            return OwnerDashboardResponse.PropertyPerformance.builder()
                .propertyId(property.getPropertyId()).propertyTitle(property.getTitleAr())
                .totalViews(property.getViewCount())
                .totalBookings((int) bookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.confirmed || 
                    b.getStatus() == Booking.BookingStatus.completed).count())
                .totalRevenue(bookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.confirmed || 
                    b.getStatus() == Booking.BookingStatus.completed).map(Booking::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add))
                .averageRating(property.getAverageRating()).status(property.getStatus().name()).build();
        }).collect(Collectors.toList());
    }
    
    private PlatformAnalyticsResponse.PlatformOverview buildPlatformOverview(LocalDate startDate, LocalDate endDate) {
        List<User> allUsers = userRepository.findAll();
        List<Property> allProperties = propertyRepository.findAll();
        List<Booking> allBookings = bookingRepository.findAll();
        return PlatformAnalyticsResponse.PlatformOverview.builder()
            .totalUsers((int) allUsers.size())
            .newUsersInPeriod((int) allUsers.stream().filter(u -> u.getCreatedAt().toLocalDate().isAfter(startDate.minusDays(1)) &&
                u.getCreatedAt().toLocalDate().isBefore(endDate.plusDays(1))).count())
            .totalProperties((int) allProperties.size())
            .newPropertiesInPeriod((int) allProperties.stream().filter(p -> p.getCreatedAt().toLocalDate().isAfter(startDate.minusDays(1)) &&
                p.getCreatedAt().toLocalDate().isBefore(endDate.plusDays(1))).count())
            .activeProperties((int) allProperties.stream().filter(p -> p.getStatus() == Property.PropertyStatus.active).count())
            .totalBookings((int) allBookings.size())
            .newBookingsInPeriod((int) allBookings.stream().filter(b -> b.getRequestedAt().toLocalDate().isAfter(startDate.minusDays(1)) &&
                b.getRequestedAt().toLocalDate().isBefore(endDate.plusDays(1))).count())
            .totalRevenue(allBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.confirmed || 
                b.getStatus() == Booking.BookingStatus.completed).map(Booking::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add))
            .revenueInPeriod(allBookings.stream().filter(b -> (b.getStatus() == Booking.BookingStatus.confirmed || 
                b.getStatus() == Booking.BookingStatus.completed) && b.getRequestedAt().toLocalDate().isAfter(startDate.minusDays(1)) &&
                b.getRequestedAt().toLocalDate().isBefore(endDate.plusDays(1))).map(Booking::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add))
            .averagePlatformRating(allProperties.isEmpty() ? BigDecimal.ZERO : allProperties.stream().map(Property::getAverageRating)
                .filter(r -> r.compareTo(BigDecimal.ZERO) > 0).reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(allProperties.size()), 2, RoundingMode.HALF_UP))
            .totalReviews((int) reviewRepository.count()).build();
    }
    
    private List<PlatformAnalyticsResponse.GrowthMetric> getUserGrowthChart(LocalDate startDate, LocalDate endDate) {
        return userRepository.findAll().stream()
            .filter(u -> u.getCreatedAt().toLocalDate().isAfter(startDate.minusDays(1)) &&
                u.getCreatedAt().toLocalDate().isBefore(endDate.plusDays(1)))
            .collect(Collectors.groupingBy(u -> u.getCreatedAt().toLocalDate(), Collectors.counting()))
            .entrySet().stream().map(entry -> PlatformAnalyticsResponse.GrowthMetric.builder()
                .date(entry.getKey()).count(entry.getValue().intValue()).value(null).build())
            .sorted((a, b) -> a.getDate().compareTo(b.getDate())).collect(Collectors.toList());
    }
    
    private List<PlatformAnalyticsResponse.GrowthMetric> getPropertyGrowthChart(LocalDate startDate, LocalDate endDate) {
        return propertyRepository.findAll().stream()
            .filter(p -> p.getCreatedAt().toLocalDate().isAfter(startDate.minusDays(1)) &&
                p.getCreatedAt().toLocalDate().isBefore(endDate.plusDays(1)))
            .collect(Collectors.groupingBy(p -> p.getCreatedAt().toLocalDate(), Collectors.counting()))
            .entrySet().stream().map(entry -> PlatformAnalyticsResponse.GrowthMetric.builder()
                .date(entry.getKey()).count(entry.getValue().intValue()).value(null).build())
            .sorted((a, b) -> a.getDate().compareTo(b.getDate())).collect(Collectors.toList());
    }
    
    private List<PlatformAnalyticsResponse.GrowthMetric> getBookingGrowthChart(LocalDate startDate, LocalDate endDate) {
        return bookingRepository.findAll().stream()
            .filter(b -> b.getRequestedAt().toLocalDate().isAfter(startDate.minusDays(1)) &&
                b.getRequestedAt().toLocalDate().isBefore(endDate.plusDays(1)))
            .collect(Collectors.groupingBy(b -> b.getRequestedAt().toLocalDate(), Collectors.counting()))
            .entrySet().stream().map(entry -> PlatformAnalyticsResponse.GrowthMetric.builder()
                .date(entry.getKey()).count(entry.getValue().intValue()).value(null).build())
            .sorted((a, b) -> a.getDate().compareTo(b.getDate())).collect(Collectors.toList());
    }
    
    private List<PlatformAnalyticsResponse.GrowthMetric> getRevenueGrowthChart(LocalDate startDate, LocalDate endDate) {
        return bookingRepository.findAll().stream()
            .filter(b -> (b.getStatus() == Booking.BookingStatus.confirmed || b.getStatus() == Booking.BookingStatus.completed) &&
                b.getRequestedAt().toLocalDate().isAfter(startDate.minusDays(1)) &&
                b.getRequestedAt().toLocalDate().isBefore(endDate.plusDays(1)))
            .collect(Collectors.groupingBy(b -> b.getRequestedAt().toLocalDate(),
                Collectors.reducing(BigDecimal.ZERO, Booking::getTotalPrice, BigDecimal::add)))
            .entrySet().stream().map(entry -> PlatformAnalyticsResponse.GrowthMetric.builder()
                .date(entry.getKey()).count(null).value(entry.getValue()).build())
            .sorted((a, b) -> a.getDate().compareTo(b.getDate())).collect(Collectors.toList());
    }
    
    private List<PlatformAnalyticsResponse.TopLocation> getTopLocations() {
        return propertyRepository.findAll().stream().filter(p -> p.getStatus() == Property.PropertyStatus.active)
            .collect(Collectors.groupingBy(p -> p.getGovernorate() + "," + p.getCity()))
            .entrySet().stream().map(entry -> {
                String[] location = entry.getKey().split(",");
                List<Property> properties = entry.getValue();
                int bookingCount = 0;
                BigDecimal totalRevenue = BigDecimal.ZERO;
                BigDecimal totalPrice = BigDecimal.ZERO;
                int priceCount = 0;
                for (Property property : properties) {
                    List<Booking> bookings = bookingRepository.findByPropertyPropertyIdOrderByRequestedAtDesc(property.getPropertyId());
                    bookingCount += (int) bookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.confirmed || 
                        b.getStatus() == Booking.BookingStatus.completed).count();
                    totalRevenue = totalRevenue.add(bookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.confirmed || 
                        b.getStatus() == Booking.BookingStatus.completed).map(Booking::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add));
                    if (property.getPricePerNight() != null) {
                        totalPrice = totalPrice.add(property.getPricePerNight());
                        priceCount++;
                    }
                }
                return PlatformAnalyticsResponse.TopLocation.builder()
                    .governorate(location[0]).city(location[1]).propertyCount(properties.size())
                    .bookingCount(bookingCount).totalRevenue(totalRevenue)
                    .averagePrice(priceCount > 0 ? totalPrice.divide(BigDecimal.valueOf(priceCount), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                    .build();
            }).sorted((a, b) -> Integer.compare(b.getPropertyCount(), a.getPropertyCount()))
            .limit(10).collect(Collectors.toList());
    }
    
    private List<PlatformAnalyticsResponse.PropertyTypeStats> getPropertyTypeStats() {
        return propertyRepository.findAll().stream().filter(p -> p.getStatus() == Property.PropertyStatus.active)
            .collect(Collectors.groupingBy(Property::getPropertyType))
            .entrySet().stream().map(entry -> {
                List<Property> properties = entry.getValue();
                int bookingCount = 0;
                BigDecimal totalRevenue = BigDecimal.ZERO;
                BigDecimal totalPrice = BigDecimal.ZERO;
                BigDecimal totalRating = BigDecimal.ZERO;
                int priceCount = 0;
                int ratingCount = 0;
                for (Property property : properties) {
                    List<Booking> bookings = bookingRepository.findByPropertyPropertyIdOrderByRequestedAtDesc(property.getPropertyId());
                    bookingCount += (int) bookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.confirmed || 
                        b.getStatus() == Booking.BookingStatus.completed).count();
                    totalRevenue = totalRevenue.add(bookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.confirmed || 
                        b.getStatus() == Booking.BookingStatus.completed).map(Booking::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add));
                    if (property.getPricePerNight() != null) {
                        totalPrice = totalPrice.add(property.getPricePerNight());
                        priceCount++;
                    }
                    if (property.getAverageRating().compareTo(BigDecimal.ZERO) > 0) {
                        totalRating = totalRating.add(property.getAverageRating());
                        ratingCount++;
                    }
                }
                return PlatformAnalyticsResponse.PropertyTypeStats.builder()
                    .propertyType(entry.getKey().name()).count(properties.size()).bookingCount(bookingCount)
                    .averagePrice(priceCount > 0 ? totalPrice.divide(BigDecimal.valueOf(priceCount), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                    .totalRevenue(totalRevenue)
                    .averageRating(ratingCount > 0 ? totalRating.divide(BigDecimal.valueOf(ratingCount), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO)
                    .build();
            }).sorted((a, b) -> Integer.compare(b.getCount(), a.getCount())).collect(Collectors.toList());
    }
    
    private PlatformAnalyticsResponse.UserStats buildUserStats(LocalDate startDate, LocalDate endDate) {
        List<User> allUsers = userRepository.findAll();
        return PlatformAnalyticsResponse.UserStats.builder()
            .totalRenters((int) allUsers.stream().filter(u -> u.getUserType() == User.UserType.renter).count())
            .totalLandlords((int) allUsers.stream().filter(u -> u.getUserType() == User.UserType.landlord).count())
            .totalBrokers((int) allUsers.stream().filter(u -> u.getUserType() == User.UserType.broker).count())
            .activeUsersInPeriod((int) allUsers.stream().filter(u -> u.getLastActivity() != null &&
                u.getLastActivity().toLocalDate().isAfter(startDate.minusDays(1)) &&
                u.getLastActivity().toLocalDate().isBefore(endDate.plusDays(1))).count())
            .newRentersInPeriod((int) allUsers.stream().filter(u -> u.getUserType() == User.UserType.renter &&
                u.getCreatedAt().toLocalDate().isAfter(startDate.minusDays(1)) &&
                u.getCreatedAt().toLocalDate().isBefore(endDate.plusDays(1))).count())
            .newLandlordsInPeriod((int) allUsers.stream().filter(u -> u.getUserType() == User.UserType.landlord &&
                u.getCreatedAt().toLocalDate().isAfter(startDate.minusDays(1)) &&
                u.getCreatedAt().toLocalDate().isBefore(endDate.plusDays(1))).count())
            .build();
    }
    
    private PlatformAnalyticsResponse.BookingStats buildBookingStats() {
        List<Booking> allBookings = bookingRepository.findAll();
        long confirmedAndCompleted = allBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.confirmed || 
                b.getStatus() == Booking.BookingStatus.completed).count();
        BigDecimal totalValue = allBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.confirmed || 
                b.getStatus() == Booking.BookingStatus.completed)
            .map(Booking::getTotalPrice).reduce(BigDecimal.ZERO, BigDecimal::add);
        int totalNights = allBookings.stream()
            .filter(b -> b.getStatus() == Booking.BookingStatus.confirmed || 
                b.getStatus() == Booking.BookingStatus.completed)
            .mapToInt(Booking::getNumberOfNights).sum();
        return PlatformAnalyticsResponse.BookingStats.builder()
            .pendingBookings((int) allBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.pending).count())
            .confirmedBookings((int) allBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.confirmed).count())
            .completedBookings((int) allBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.completed).count())
            .cancelledBookings((int) allBookings.stream().filter(b -> b.getStatus() == Booking.BookingStatus.cancelled_by_renter || 
                b.getStatus() == Booking.BookingStatus.cancelled_by_owner).count())
            .averageBookingValue(confirmedAndCompleted > 0 ? 
                totalValue.divide(BigDecimal.valueOf(confirmedAndCompleted), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO)
            .conversionRate(allBookings.size() > 0 ? BigDecimal.valueOf(confirmedAndCompleted)
                .divide(BigDecimal.valueOf(allBookings.size()), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)) : BigDecimal.ZERO)
            .averageNightsPerBooking(confirmedAndCompleted > 0 ? (int) (totalNights / confirmedAndCompleted) : 0)
            .build();
    }
}