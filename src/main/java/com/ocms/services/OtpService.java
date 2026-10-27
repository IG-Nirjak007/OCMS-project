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

        try {
            if (redisTemplate != null && redisTemplate.getConnectionFactory() != null) {
                redisTemplate.opsForValue().set("OTP:" + email, otp, OTP_EXPIRATION_MINUTES, TimeUnit.MINUTES);
                return otp;
            }
        } catch (Exception ignored) {
            // Redis unreachable, fallback to in-memory store
        }

        inMemoryOtpStore.put("OTP:" + email, new OtpEntry(otp, System.currentTimeMillis() + OTP_EXPIRATION_MINUTES * 60 * 1000L));
        return otp;
    }

    // Validates the OTP against Redis or in-memory store
    public boolean validateOtp(String email, String inputOtp) {
        try {
            if (redisTemplate != null && redisTemplate.getConnectionFactory() != null) {
                String storedOtp = redisTemplate.opsForValue().get("OTP:" + email);
                if (storedOtp != null && storedOtp.equals(inputOtp)) {
                    redisTemplate.delete("OTP:" + email);
                    return true;
                }
            }
        } catch (Exception ignored) {
            // Fallback to in-memory store
        }

        OtpEntry entry = inMemoryOtpStore.get("OTP:" + email);
        if (entry != null && entry.isValid(inputOtp)) {
            inMemoryOtpStore.remove("OTP:" + email);
            return true;
        }
        return false;
    }
}