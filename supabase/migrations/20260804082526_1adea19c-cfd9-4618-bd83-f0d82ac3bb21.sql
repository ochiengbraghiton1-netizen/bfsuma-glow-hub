DROP POLICY IF EXISTS "System can insert PV logs" ON public.distributor_pv_logs;

REVOKE INSERT, UPDATE, DELETE ON public.distributor_pv_logs FROM anon, authenticated;
GRANT SELECT ON public.distributor_pv_logs TO authenticated;
GRANT ALL ON public.distributor_pv_logs TO service_role;

REVOKE EXECUTE ON FUNCTION public.record_distributor_pv(uuid, uuid, numeric, uuid, text) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.record_distributor_pv(uuid, uuid, numeric, uuid, text) TO service_role;