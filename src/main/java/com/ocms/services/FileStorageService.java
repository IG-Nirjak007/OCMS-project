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
            String originalName = Paths.get(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file").getFileName().toString();
            String cleanName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
            String fileName = System.currentTimeMillis() + "_" + cleanName;
            Path targetLocation = this.storageLocation.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    /** Alias for {@link #storeFile(MultipartFile)} used by controllers. */
    public String store(MultipartFile file) {
        return storeFile(file);
    }

    public Path loadFile(String filePathOrName) {
        if (filePathOrName == null) return null;
        Path path = Paths.get(filePathOrName);
        if (Files.exists(path)) {
            return path;
        }
        Path resolved = this.storageLocation.resolve(path.getFileName().toString()).normalize();
        if (Files.exists(resolved)) {
            return resolved;
        }
        return resolved;
    }

    public boolean deleteFile(String filePathOrName) {
        if (filePathOrName == null) return false;
        try {
            Path file = loadFile(filePathOrName);
            if (file != null && Files.exists(file)) {
                return Files.deleteIfExists(file);
            }
        } catch (IOException ignored) {
        }
        return false;
    }
}