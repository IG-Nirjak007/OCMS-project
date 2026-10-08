package com.ocms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class OcmsApplication {

    public static void main(String[] args) {
        SpringApplication.run(OcmsApplication.class, args);
    }
}
