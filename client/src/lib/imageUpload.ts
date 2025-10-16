// Image upload utilities
// Note: This is a local-only implementation for development
// For production, implement a proper file upload service

export class ImageUploadError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
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
