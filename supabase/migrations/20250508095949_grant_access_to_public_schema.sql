GRANT USAGE ON SCHEMA "public" to authenticated;

GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT ON public.locations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.item_locations TO authenticated;
GRANT SELECT, INSERT ON public.transactions TO authenticated;