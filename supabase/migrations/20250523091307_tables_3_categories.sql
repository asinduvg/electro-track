CREATE TABLE IF NOT EXISTS public.categories
(
    id          bigint primary key generated always as identity,
    category    text NOT NULL,
    subcategory text NOT NULL,
    CONSTRAINT unique_category_subcategory UNIQUE (category, subcategory)
) WITH (OIDS= FALSE);

ALTER TABLE public.items
    DROP COLUMN category,
    DROP COLUMN subcategory,
    ADD COLUMN category_id bigint,
    ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

-- Create an index on the category_id for better performance
CREATE INDEX idx_items_category_id ON public.items(category_id);