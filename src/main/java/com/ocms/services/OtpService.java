package com.ocms.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    private final StringRedisTemplate redisTemplate;
    private final Map<String, OtpEntry> inMemoryOtpStore = new ConcurrentHashMap<>();
    private static final int OTP_EXPIRATION_MINUTES = 5;

    public OtpService(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    private static class OtpEntry {
        final String otp;
        final long expiresAt;

        OtpEntry(String otp, long expiresAt) {
            this.otp = otp;
            this.expiresAt = expiresAt;
        }

        boolean isValid(String inputOtp) {
            return System.currentTimeMillis() <= expiresAt && otp.equals(inputOtp);
        }
    }

    // Generates a 6-digit numeric OTP and stores it (in Redis if available, or in-memory fallback)
    public String generateAndStoreOtp(String email) {
        SecureRandom random = new SecureRandom();
        String otp = String.format("%06d", random.nextInt(1000000));
        String key = "OTP:" + email.trim().toLowerCase();

        try {
            if (redisTemplate != null && redisTemplate.getConnectionFactory() != null) {
                redisTemplate.opsForValue().set(key, otp, OTP_EXPIRATION_MINUTES, TimeUnit.MINUTES);
                System.out.println("[OtpService] Successfully stored OTP in Redis -> Key: " + key + ", Value: " + otp + " (TTL: 5 min)");
                return otp;
            }
        } catch (Exception e) {
            System.err.println("[OtpService] Redis storage error (" + e.getMessage() + "), using in-memory store.");
        }

        inMemoryOtpStore.put(key, new OtpEntry(otp, System.currentTimeMillis() + OTP_EXPIRATION_MINUTES * 60 * 1000L));
        System.out.println("[OtpService] Stored OTP in in-memory store -> Key: " + key + ", Value: " + otp);
        return otp;
    }

    // Validates the OTP against Redis or in-memory store
    public boolean validateOtp(String email, String inputOtp) {
        String key = "OTP:" + email.trim().toLowerCase();
        try {
            if (redisTemplate != null && redisTemplate.getConnectionFactory() != null) {
                String storedOtp = redisTemplate.opsForValue().get(key);
                System.out.println("[OtpService] Checking Redis for key: " + key + " (Found: " + storedOtp + ")");
                if (storedOtp != null && storedOtp.equals(inputOtp.trim())) {
                    redisTemplate.delete(key);
                    System.out.println("[OtpService] Redis OTP validated & deleted for: " + key);
                    return true;
                }
            }
        } catch (Exception e) {
            System.err.println("[OtpService] Redis validation error (" + e.getMessage() + "), checking in-memory store.");
        }

        OtpEntry entry = inMemoryOtpStore.get(key);
        if (entry != null && entry.isValid(inputOtp.trim())) {
            inMemoryOtpStore.remove(key);
            System.out.println("[OtpService] In-memory OTP validated & deleted for: " + key);
            return true;
        }
        return false;
    }
}