package com.ocms.services;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    private final StringRedisTemplate redisTemplate;

    public OtpService(StringRedisTemplate redisTemplate){
        this.redisTemplate = redisTemplate;
    }

    public String generateAndSaveOtp(String email){
        String otp = String.format("%06d", new Random().nextInt(900000) + 100000);
        redisTemplate.opsForValue().set("OTP_" + email, otp, 5, TimeUnit.MINUTES);
        return otp;
    }

    public boolean validateOtp(String email,String inputOtp){
        String storedOtp = redisTemplate.opsForValue().get("OTP_" + email);
        if (storedOtp != null && storedOtp.equals(inputOtp)){
            redisTemplate.delete("OTP_" + email);
            return true;
        }
        return false;
    }

}

