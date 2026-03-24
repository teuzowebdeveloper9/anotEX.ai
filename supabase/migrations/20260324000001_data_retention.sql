-- LGPD Art. 15 — Política de retenção de dados
-- Audios e transcrições de usuários inativos por mais de 365 dias
-- devem ser deletados automaticamente.
--
-- Esta migration cria uma função que pode ser chamada por um cron externo
-- (Railway Cron, Supabase Edge Functions Cron, etc.) para deletar dados antigos.
--
-- ATENÇÃO: A deleção de audios no R2 deve ser feita ANTES de chamar esta função,
-- pois o banco não tem acesso ao storage externo. O backend deve buscar os
-- storage_keys antes de deletar e chamar o R2 delete primeiro.
--
-- Uso manual ou via cron:
--   SELECT delete_old_user_data();

CREATE OR REPLACE FUNCTION delete_old_user_data()
RETURNS TABLE(deleted_audio_ids UUID[], deleted_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cutoff TIMESTAMPTZ := now() - INTERVAL '365 days';
  v_deleted_ids UUID[];
  v_count INTEGER;
BEGIN
  -- Seleciona audios criados há mais de 365 dias com status COMPLETED ou FAILED
  -- (nunca deletar audios PENDING/PROCESSING — podem estar em processamento)
  WITH deleted AS (
    DELETE FROM audios
    WHERE created_at < v_cutoff
      AND status IN ('COMPLETED', 'FAILED')
    RETURNING id
  )
  SELECT array_agg(id), count(*)::INTEGER
  INTO v_deleted_ids, v_count
  FROM deleted;

  RETURN QUERY SELECT
    COALESCE(v_deleted_ids, ARRAY[]::UUID[]),
    COALESCE(v_count, 0);
END;
$$;

-- Revogar acesso público à função — só o service_role pode chamar
REVOKE ALL ON FUNCTION delete_old_user_data() FROM PUBLIC;
