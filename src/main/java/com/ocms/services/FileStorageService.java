package com.ocms.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service responsible for storing uploaded files (e.g., assignment submissions).
 * Implement the store method with actual file system or cloud storage logic.
 */
@Service
public class FileStorageService {

    /**
     * Stores the given multipart file and returns the path/URL where it is saved.
     *
     * @param file the uploaded file
     * @return the stored file path or identifier
     */
    public String store(MultipartFile file) {
        // TODO: implement actual file storage logic (local disk, S3, etc.)
        throw new UnsupportedOperationException("FileStorageService.store() is not yet implemented");
    }
}
