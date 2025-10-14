package com.ajarly.backend.service;

import com.ajarly.backend.dto.PaymentDto;
import com.ajarly.backend.model.Booking;
import com.ajarly.backend.model.Transaction;
import com.ajarly.backend.model.User;
import com.ajarly.backend.repository.BookingRepository;
import com.ajarly.backend.repository.TransactionRepository;
import com.ajarly.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {
    
    private final TransactionRepository transactionRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final FawryPaymentService fawryPaymentService;
    
    private static final BigDecimal PLATFORM_FEE_PERCENT = new BigDecimal("10.00");
    private static final BigDecimal FAWRY_FEE_PERCENT = new BigDecimal("2.75");
    
    /**
     * Create payment intent for a booking
     */
    @Transactional
    public PaymentDto.PaymentIntentResponse createPaymentIntent(
            Long userId, 
            PaymentDto.CreatePaymentIntentRequest request
    ) {
        log.info("Creating payment intent for booking: {} by user: {}", 
                 request.getBookingId(), userId);
        
        // 1. Validate booking
        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        if (!booking.getRenter().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: This booking does not belong to you");
        }
        
        if (booking.getPaymentStatus() == Booking.PaymentStatus.paid) {
            throw new RuntimeException("Booking is already paid");
        }
        
        // 2. Calculate amounts
        BigDecimal totalAmount = booking.getTotalPrice();
        BigDecimal platformFee = calculatePlatformFee(totalAmount);
        BigDecimal ownerPayout = totalAmount.subtract(platformFee);
        
        // 3. Generate unique transaction reference
        String transactionRef = "AJ-TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        // 4. Create transaction record
        Transaction transaction = new Transaction();
        transaction.setTransactionReference(transactionRef);
        transaction.setUser(booking.getRenter());
        transaction.setBooking(booking);
        transaction.setTransactionType(Transaction.TransactionType.booking_payment);
        transaction.setAmount(totalAmount);
        transaction.setCurrency("EGP");
        transaction.setPaymentMethod(
            Transaction.PaymentMethod.valueOf(request.getPaymentMethod().toLowerCase())
        );
        transaction.setPaymentGateway("fawry");
        transaction.setStatus(Transaction.TransactionStatus.pending);
        transaction.setPlatformFeeAmount(platformFee);
        transaction.setOwnerPayoutAmount(ownerPayout);
        
        Transaction savedTransaction = transactionRepository.save(transaction);
        
        // 5. Create Fawry payment intent (SIMULATED)
        Map<String, Object> fawryResponse = fawryPaymentService.createPaymentIntent(
            transactionRef,
            totalAmount,
            request.getCustomerName() != null ? request.getCustomerName() : 
                booking.getRenter().getFirstName() + " " + booking.getRenter().getLastName(),
            request.getCustomerEmail() != null ? request.getCustomerEmail() : 
                booking.getRenter().getEmail(),
            request.getCustomerPhone() != null ? request.getCustomerPhone() : 
                booking.getRenter().getPhoneNumber()
        );
        
        // 6. Update transaction with gateway response
        savedTransaction.setGatewayTransactionId(fawryResponse.get("fawryRefNumber").toString());
        savedTransaction.setGatewayResponse(fawryResponse.toString());
        transactionRepository.save(savedTransaction);
        
        log.info("✅ Payment intent created: {} for amount: {} EGP", transactionRef, totalAmount);
        
        // 7. Build response
        return new PaymentDto.PaymentIntentResponse(
            transactionRef,
            fawryResponse.get("fawryRefNumber").toString(),
            totalAmount,
            "EGP",
            "pending",
            request.getPaymentMethod(),
            fawryResponse.get("paymentUrl").toString(),
            fawryResponse.get("qrCode").toString(),
            (LocalDateTime) fawryResponse.get("expiresAt"),
            "Payment intent created. Please complete payment via Fawry."
        );
    }
    
    /**
     * Confirm payment after user completes it
     */
    @Transactional
    public PaymentDto.PaymentConfirmResponse confirmPayment(
            PaymentDto.ConfirmPaymentRequest request
    ) {
        log.info("Confirming payment for transaction: {}", request.getTransactionReference());
        
        // 1. Find transaction
        Transaction transaction = transactionRepository
            .findByTransactionReference(request.getTransactionReference())
            .orElseThrow(() -> new RuntimeException("Transaction not found"));
        
        if (transaction.getStatus() == Transaction.TransactionStatus.completed) {
            throw new RuntimeException("Transaction already completed");
        }
        
        // 2. Verify payment with Fawry (SIMULATED)
        Map<String, Object> verificationResponse = fawryPaymentService.verifyPayment(
            transaction.getGatewayTransactionId()
        );
        
        String paymentStatus = verificationResponse.get("paymentStatus").toString();
        
        if (!"PAID".equals(paymentStatus) && !Boolean.TRUE.equals(request.getSimulateSuccess())) {
            // Payment failed
            transaction.setStatus(Transaction.TransactionStatus.failed);
            transaction.setFailureReason("Payment not completed at gateway");
            transactionRepository.save(transaction);
            
            throw new RuntimeException("Payment verification failed. Status: " + paymentStatus);
        }
        
        // 3. Update transaction status
        transaction.setStatus(Transaction.TransactionStatus.completed);
        transaction.setCompletedAt(LocalDateTime.now());
        transaction.setGatewayResponse(verificationResponse.toString());
        transactionRepository.save(transaction);
        
        // 4. Update booking payment status
        Booking booking = transaction.getBooking();
        booking.setPaymentStatus(Booking.PaymentStatus.paid);
        booking.setPaymentMethod(
            Booking.PaymentMethod.valueOf(transaction.getPaymentMethod().name())
        );
        bookingRepository.save(booking);
        
        log.info("✅ Payment confirmed successfully: {}", transaction.getTransactionReference());
        
        // 5. Build response
        return new PaymentDto.PaymentConfirmResponse(
            transaction.getTransactionId(),
            transaction.getTransactionReference(),
            "completed",
            transaction.getAmount(),
            transaction.getPaymentMethod().name(),
            transaction.getCompletedAt(),
            "Payment completed successfully",
            new PaymentDto.BookingUpdateInfo(
                booking.getBookingId(),
                booking.getStatus().name(),
                booking.getPaymentStatus().name()
            )
        );
    }
    
    /**
     * Process refund for a booking
     */
    @Transactional
    public PaymentDto.RefundResponse processRefund(
            Long userId,
            PaymentDto.RefundRequest request
    ) {
        log.info("Processing refund for booking: {} by user: {}", request.getBookingId(), userId);
        
        // 1. Validate booking
        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Only renter, owner, or admin can request refund
        if (!booking.getRenter().getUserId().equals(userId) && 
            !booking.getOwner().getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to request refund for this booking");
        }
        
        if (booking.getPaymentStatus() != Booking.PaymentStatus.paid) {
            throw new RuntimeException("Booking is not paid, cannot refund");
        }
        
        // 2. Find original payment transaction
        Transaction originalTransaction = transactionRepository
            .findByBookingAndStatus(booking.getBookingId(), Transaction.TransactionStatus.completed)
            .orElseThrow(() -> new RuntimeException("Original payment transaction not found"));
        
        // 3. Validate refund amount
        BigDecimal maxRefund = originalTransaction.getAmount();
        if (request.getRefundAmount().compareTo(maxRefund) > 0) {
            throw new RuntimeException("Refund amount exceeds original payment");
        }
        
        // 4. Check if admin rejected (future feature)
        if (Boolean.FALSE.equals(request.getAdminApproved())) {
            throw new RuntimeException("Refund rejected by admin");
        }
        
        // 5. Process refund via Fawry (SIMULATED)
        Map<String, Object> refundResponse = fawryPaymentService.processRefund(
            originalTransaction.getGatewayTransactionId(),
            request.getRefundAmount(),
            request.getReason()
        );
        
        // 6. Create refund transaction
        String refundRef = "AJ-REF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        
        Transaction refundTransaction = new Transaction();
        refundTransaction.setTransactionReference(refundRef);
        refundTransaction.setUser(booking.getRenter());
        refundTransaction.setBooking(booking);
        refundTransaction.setTransactionType(Transaction.TransactionType.booking_refund);
        refundTransaction.setAmount(request.getRefundAmount().negate()); // Negative amount
        refundTransaction.setCurrency("EGP");
        refundTransaction.setPaymentMethod(originalTransaction.getPaymentMethod());
        refundTransaction.setPaymentGateway("fawry");
        refundTransaction.setStatus(Transaction.TransactionStatus.completed);
        refundTransaction.setGatewayTransactionId(refundResponse.get("refundRefNumber").toString());
        refundTransaction.setGatewayResponse(refundResponse.toString());
        refundTransaction.setCompletedAt(LocalDateTime.now());
        
        Transaction savedRefund = transactionRepository.save(refundTransaction);
        
        // 7. Update booking
        booking.setPaymentStatus(Booking.PaymentStatus.refunded);
        booking.setRefundAmount(request.getRefundAmount());
        bookingRepository.save(booking);
        
        log.info("✅ Refund processed: {} for amount: {} EGP", refundRef, request.getRefundAmount());
        
        return new PaymentDto.RefundResponse(
            savedRefund.getTransactionId(),
            refundRef,
            request.getRefundAmount(),
            "completed",
            request.getReason(),
            savedRefund.getCompletedAt(),
            "Refund processed successfully"
        );
    }
    
    /**
     * Get payment history for a user
     */
    public List<PaymentDto.PaymentHistoryResponse> getPaymentHistory(Long userId) {
        log.info("Fetching payment history for user: {}", userId);
        
        List<Transaction> transactions = transactionRepository
            .findByUser_UserIdOrderByCreatedAtDesc(userId);
        
        return transactions.stream()
            .map(this::mapToHistoryResponse)
            .collect(Collectors.toList());
    }
    
    /**
     * Helper: Map Transaction to PaymentHistoryResponse
     */
    private PaymentDto.PaymentHistoryResponse mapToHistoryResponse(Transaction transaction) {
        String bookingRef = null;
        String propertyTitle = null;
        
        if (transaction.getBooking() != null) {
            bookingRef = transaction.getBooking().getBookingReference();
            if (transaction.getBooking().getProperty() != null) {
                propertyTitle = transaction.getBooking().getProperty().getTitleAr();
            }
        }
        
        return new PaymentDto.PaymentHistoryResponse(
            transaction.getTransactionId(),
            transaction.getTransactionReference(),
            transaction.getTransactionType().name(),
            transaction.getAmount(),
            transaction.getCurrency(),
            transaction.getPaymentMethod().name(),
            transaction.getStatus().name(),
            bookingRef,
            propertyTitle,
            transaction.getCreatedAt(),
            transaction.getCompletedAt()
        );
    }
    
    /**
     * Helper: Calculate platform fee (10%)
     */
    private BigDecimal calculatePlatformFee(BigDecimal amount) {
        return amount.multiply(PLATFORM_FEE_PERCENT)
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
    }
    
    /**
     * Helper: Calculate Fawry transaction fee (2.75%)
     */
    private BigDecimal calculateFawryFee(BigDecimal amount) {
        return amount.multiply(FAWRY_FEE_PERCENT)
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
    }
}
