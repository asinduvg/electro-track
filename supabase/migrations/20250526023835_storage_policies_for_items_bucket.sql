-- Create storage policies for items bucket
-- This should be added as a new migration file

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'items');

-- Allow public read access to images
CREATE POLICY "Allow public read access to images"
    ON storage.objects
    FOR SELECT
    TO public
    USING (bucket_id = 'items');

-- Allow authenticated users to update their uploaded images
CREATE POLICY "Allow authenticated users to update images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'items');

-- Allow authenticated users to delete images
CREATE POLICY "Allow authenticated users to delete images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'items');