-- Agenda o cron de retenção de dados via pg_cron (nativo no Supabase)
-- Executa todo dia 1 do mês às 3h UTC
-- LGPD Art. 15 — elimina dados desnecessários automaticamente

SELECT cron.schedule(
  'data-retention-monthly',   -- nome do job (único)
  '0 3 1 * *',                -- cron expression: dia 1, às 03:00 UTC
  $$SELECT delete_old_user_data()$$
);
