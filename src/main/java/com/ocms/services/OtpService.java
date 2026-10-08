package com.ocms.services;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    private final StringRedisTemplate redisTemplate;
    private static final int OTP_EXPIRATION_MINUTES = 5;

    public OtpService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    // Generates a 6-digit numeric OTP and stores it in Redis with a 5-minute TTL
    public String generateAndStoreOtp(String email) {
        SecureRandom random = new SecureRandom();
        String otp = String.format("%06d", random.nextInt(1000000));

        // Key format: OTP:<email>
        redisTemplate.opsForValue().set("OTP:" + email, otp, OTP_EXPIRATION_MINUTES, TimeUnit.MINUTES);
        return otp;
    }

    // Validates the OTP against Redis
    public boolean validateOtp(String email, String inputOtp) {
        String storedOtp = redisTemplate.opsForValue().get("OTP:" + email);
        if (storedOtp != null && storedOtp.equals(inputOtp)) {
            redisTemplate.delete("OTP:" + email); // Delete after single use
            return true;
        }
        return false;
    }
}