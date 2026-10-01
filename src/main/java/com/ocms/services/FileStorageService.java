package com.ocms.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;

@Service
public class FileStorageService {

    private final Path storageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    public FileStorageService() {
        try {
            Files.createDirectories(storageLocation);
        } catch (Exception e) {
            throw new RuntimeException("Could not create storage directory.", e);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) return null;
        try {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path targetLocation = this.storageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return targetLocation.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    /** Alias for {@link #storeFile(MultipartFile)} used by controllers. */
    public String store(MultipartFile file) {
        return storeFile(file);
    }

    public Path loadFile(String filePath) {
        return Paths.get(filePath);
    }
}