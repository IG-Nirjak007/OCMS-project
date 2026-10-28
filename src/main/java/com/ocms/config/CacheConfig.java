package com.ocms.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(@Autowired(required = false) RedisConnectionFactory connectionFactory) {
        if (connectionFactory != null) {
            try {
                connectionFactory.getConnection().ping();
                RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                        .entryTtl(Duration.ofMinutes(10))
                        .disableCachingNullValues()
                        .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));
                System.out.println("[CacheConfig] Redis online on localhost:6379 -> Active RedisCacheManager initialized.");
                return RedisCacheManager.builder(connectionFactory)
                        .cacheDefaults(config)
                        .build();
            } catch (Exception e) {
                System.err.println("[CacheConfig] Redis ping failed (" + e.getMessage() + ") -> Using in-memory ConcurrentMapCacheManager fallback.");
            }
        }
        return new ConcurrentMapCacheManager("courses");
    }

    @Bean
    public StringRedisTemplate stringRedisTemplate(@Autowired(required = false) RedisConnectionFactory connectionFactory) {
        if (connectionFactory != null) {
            try {
                return new StringRedisTemplate(connectionFactory);
            } catch (Exception e) {
                System.err.println("[CacheConfig] Could not initialize StringRedisTemplate: " + e.getMessage());
            }
        }
        return null;
    }
}
