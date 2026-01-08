package com.org.QuickRide.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisCallback;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
public class RedisCacheInitializer {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Value("${spring.profiles.active:}")
    private String activeProfile;

    @EventListener(ContextRefreshedEvent.class)
    public void clearRedisCacheOnStartup() {
        if ("dev".equalsIgnoreCase(activeProfile)) {
            System.out.println("🚀 Clearing Redis cache on startup for DEV profile...");

            // ✅ Safe and non-deprecated way to flush only the current DB
            redisTemplate.execute((RedisCallback)connection -> {
                connection.serverCommands().flushDb();
                return null;
            });
        } else {
            System.out.println("⚙️ Redis cache not cleared (Profile: " + activeProfile + ")");
        }
    }
}


