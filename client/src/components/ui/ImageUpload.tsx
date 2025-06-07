import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import { Button } from './Button';
import { validateImage, createImagePreview, cleanupImagePreview, ImageUploadError } from '../../lib/imageUpload';

interface ImageUploadProps {
    currentImageUrl?: string;
    onImageChange: (file: File | null, previewUrl: string | null) => void;
    onError: (error: string) => void;
    disabled?: boolean;
    maxWidth?: number;
    maxHeight?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
                                                            currentImageUrl,
                                                            onImageChange,
                                                            onError,
                                                            disabled = false,
                                                            maxWidth = 400,
                                                            maxHeight = 300
                                                        }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl !== currentImageUrl) {
                cleanupImagePreview(previewUrl);
            }
        };
    }, [previewUrl, currentImageUrl]);

    const handleFileSelect = (file: File) => {
        try {
            // Validate the image
            validateImage(file);
            onError(''); // Clear previous errors

            // Clean up previous preview if it was a local URL (not the current image URL)
            if (previewUrl && previewUrl !== currentImageUrl) {
                cleanupImagePreview(previewUrl);
            }

            // Create preview URL
            const preview = createImagePreview(file);

            // Update state
            setSelectedFile(file);
            setPreviewUrl(preview);

            // Notify parent component
            onImageChange(file, preview);

        } catch (error) {
            console.error('File selection error:', error);
            if (error instanceof ImageUploadError) {
                onError(error.message);
            } else {
                onError('Failed to process image. Please try again.');
            }
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        if (disabled) return;

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!disabled) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleRemoveImage = () => {
        // Clean up preview URL if it's a local URL (not the current image URL)
        if (previewUrl && previewUrl !== currentImageUrl) {
            cleanupImagePreview(previewUrl);
        }

        // Reset state
        setSelectedFile(null);
        setPreviewUrl(null);

        // Clear file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        // Notify parent component
        onImageChange(null, null);
    };

    const triggerFileInput = (e?: React.MouseEvent) => {
        // Prevent event bubbling if called from button click
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!disabled && fileInputRef.current) {
            // Reset the input value to allow selecting the same file again
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
                Item Image
            </label>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileInputChange}
                disabled={disabled}
            />

            {/* Image Preview */}
            {previewUrl && (
                <div className="relative inline-block">
                    <img
                        src={previewUrl}
                        alt="Item preview"
                        className="rounded-lg border border-gray-300 shadow-sm object-cover"
                        style={{ maxWidth, maxHeight }}
                    />

                    {/* Remove button */}
                    {!disabled && (
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md"
                        >
                            <X size={16} />
                        </button>
                    )}

                    {/* Badge to indicate if image is new */}
                    {selectedFile && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            New
                        </div>
                    )}
                </div>
            )}

            {/* Upload Area */}
            {!previewUrl && (
                <div
                    className={`
                        relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
                        ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
                        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}
                    `}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={triggerFileInput}
                >
                    <div className="flex flex-col items-center space-y-2">
                        <Camera className="h-8 w-8 text-gray-400" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">
                                PNG, JPG, WebP up to 5MB
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Change Image Button */}
            {previewUrl && !disabled && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    leftIcon={<Upload size={16} />}
                    onClick={triggerFileInput}
                >
                    Change Image
                </Button>
            )}

            {/* Helper text */}
            {selectedFile && (
                <p className="text-xs text-gray-500">
                    Image will be uploaded when you save the item
                </p>
            )}
        </div>
    );
};