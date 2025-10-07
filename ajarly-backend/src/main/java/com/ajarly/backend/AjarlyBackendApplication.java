package com.ajarly.backend;
// Import the required packages

import com.cloudinary.*;
import com.cloudinary.utils.ObjectUtils;
import io.github.cdimascio.dotenv.Dotenv;

import java.util.Map;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AjarlyBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(AjarlyBackendApplication.class, args);
    }

}