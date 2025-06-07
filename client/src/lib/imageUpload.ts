// src/lib/imageUpload.ts - Deferred upload version
import { supabase } from './supabase';

export class ImageUploadError extends Error {
    constructor(message: string, public code?: string) {
        super(message);
        this.name = 'ImageUploadError';
    }
}

export const validateImage = (file: File): void => {
    // Check file type
    if (!file.type.startsWith('image/')) {
        throw new ImageUploadError('Please upload an image file');
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        throw new ImageUploadError('Image size should be less than 5MB');
    }

    // Check for supported formats
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!supportedFormats.includes(file.type)) {
        throw new ImageUploadError('Supported formats: JPEG, PNG, WebP, GIF');
    }
};

// Upload file to Supabase (called during form submission)
export const uploadItemImage = async (
    file: File,
    itemId: string
): Promise<string> => {
    try {
        // Validate the image first
        validateImage(file);

        // Generate unique filename
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        const fileName = `${itemId}-${Date.now()}.${fileExt}`;
        const filePath = `items/${fileName}`;

        // Upload file to Supabase Storage
        const { error: uploadError, data } = await supabase.storage
            .from('items')
            .upload(filePath, file, {
                upsert: true // Replace if file already exists
            });

        if (uploadError) {
            throw new ImageUploadError(`Upload failed: ${uploadError.message}`, uploadError.name);
        }

        if (!data) {
            throw new ImageUploadError('Upload completed but no data returned');
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('items')
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    } catch (error) {
        if (error instanceof ImageUploadError) {
            throw error;
        }
        throw new ImageUploadError(`Unexpected error during upload: ${error}`);
    }
};

// Delete image from Supabase
export const deleteItemImage = async (imageUrl: string): Promise<void> => {
    try {
        // Extract file path from URL
        const url = new URL(imageUrl);
        const pathSegments = url.pathname.split('/');
        const fileName = pathSegments[pathSegments.length - 1];
        const filePath = `items/${fileName}`;

        const { error } = await supabase.storage
            .from('items')
            .remove([filePath]);

        if (error) {
            throw new ImageUploadError(`Delete failed: ${error.message}`);
        }
    } catch (error) {
        if (error instanceof ImageUploadError) {
            throw error;
        }
        throw new ImageUploadError(`Unexpected error during delete: ${error}`);
    }
};

// Create a local URL for browser preview
export const createImagePreview = (file: File): string => {
    return URL.createObjectURL(file);
};

// Clean up preview URL
export const cleanupImagePreview = (previewUrl: string): void => {
    URL.revokeObjectURL(previewUrl);
};

// Utility function for image optimization (placeholder for future use)
export const getOptimizedImageUrl = (
    imageUrl: string,
    options: {
        width?: number;
        height?: number;
        quality?: number;
        format?: 'auto' | 'webp' | 'jpeg' | 'png';
    } = {}
): string => {
    if (!imageUrl) return '';

    // For now, just return the original URL
    // You can implement image transformation service integration here
    return imageUrl;
};