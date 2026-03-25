-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.audios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  size_bytes bigint NOT NULL,
  storage_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'PENDING'::text CHECK (status = ANY (ARRAY['PENDING'::text, 'PROCESSING'::text, 'COMPLETED'::text, 'FAILED'::text])),
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT audios_pkey PRIMARY KEY (id),
  CONSTRAINT audios_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transcription_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text])),
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_transcription_id_fkey FOREIGN KEY (transcription_id) REFERENCES public.transcriptions(id),
  CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.flashcard_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  study_material_id uuid NOT NULL,
  flashcard_index smallint NOT NULL,
  quality smallint NOT NULL CHECK (quality >= 0 AND quality <= 5),
  reviewed_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT flashcard_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT flashcard_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT flashcard_reviews_study_material_id_fkey FOREIGN KEY (study_material_id) REFERENCES public.study_materials(id)
);
CREATE TABLE public.pending_registrations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  token character varying NOT NULL UNIQUE,
  email character varying NOT NULL,
  name character varying,
  braip_transaction_id character varying,
  braip_plan_id character varying,
  plan_id character varying,
  role character varying DEFAULT 'corretor'::character varying,
  amount numeric,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'completed'::character varying, 'expired'::character varying]::text[])),
  expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval),
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pending_registrations_pkey PRIMARY KEY (id)
);
CREATE TABLE public.shared_links (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  token text NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'::text) UNIQUE,
  owner_id uuid NOT NULL,
  resource_type text NOT NULL CHECK (resource_type = ANY (ARRAY['transcription'::text, 'audio'::text, 'study_material'::text, 'study_folder'::text])),
  resource_id uuid NOT NULL,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT shared_links_pkey PRIMARY KEY (id),
  CONSTRAINT shared_links_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id)
);
CREATE TABLE public.study_folder_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL,
  user_id uuid NOT NULL,
  transcription_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type = ANY (ARRAY['SUMMARY'::text, 'TRANSCRIPTION'::text, 'FLASHCARDS'::text, 'MINDMAP'::text, 'QUIZ'::text])),
  title text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  audio_id uuid NOT NULL,
  CONSTRAINT study_folder_items_pkey PRIMARY KEY (id),
  CONSTRAINT study_folder_items_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.study_folders(id),
  CONSTRAINT study_folder_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT study_folder_items_transcription_id_fkey FOREIGN KEY (transcription_id) REFERENCES public.transcriptions(id),
  CONSTRAINT study_folder_items_audio_id_fkey FOREIGN KEY (audio_id) REFERENCES public.audios(id)
);
CREATE TABLE public.study_folders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  item_count integer NOT NULL DEFAULT 0,
  recommendations_unlocked boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT study_folders_pkey PRIMARY KEY (id),
  CONSTRAINT study_folders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.study_group_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member'::text CHECK (role = ANY (ARRAY['owner'::text, 'member'::text])),
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT study_group_members_pkey PRIMARY KEY (id),
  CONSTRAINT study_group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.study_groups(id),
  CONSTRAINT study_group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.study_group_shares (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL,
  shared_link_id uuid NOT NULL,
  shared_by uuid NOT NULL,
  shared_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT study_group_shares_pkey PRIMARY KEY (id),
  CONSTRAINT study_group_shares_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.study_groups(id),
  CONSTRAINT study_group_shares_shared_link_id_fkey FOREIGN KEY (shared_link_id) REFERENCES public.shared_links(id),
  CONSTRAINT study_group_shares_shared_by_fkey FOREIGN KEY (shared_by) REFERENCES auth.users(id)
);
CREATE TABLE public.study_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT study_groups_pkey PRIMARY KEY (id),
  CONSTRAINT study_groups_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id)
);
CREATE TABLE public.study_materials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  transcription_id uuid NOT NULL,
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type = ANY (ARRAY['flashcards'::text, 'mindmap'::text, 'quiz'::text])),
  status text NOT NULL DEFAULT 'PENDING'::text CHECK (status = ANY (ARRAY['PENDING'::text, 'PROCESSING'::text, 'COMPLETED'::text, 'FAILED'::text])),
  content jsonb,
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT study_materials_pkey PRIMARY KEY (id),
  CONSTRAINT study_materials_transcription_id_fkey FOREIGN KEY (transcription_id) REFERENCES public.transcriptions(id)
);
CREATE TABLE public.transcriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  audio_id uuid NOT NULL,
  user_id uuid NOT NULL,
  transcription_text text,
  summary_text text,
  language text NOT NULL DEFAULT 'pt'::text,
  status text NOT NULL DEFAULT 'PENDING'::text CHECK (status = ANY (ARRAY['PENDING'::text, 'PROCESSING'::text, 'COMPLETED'::text, 'FAILED'::text])),
  error_message text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  title text,
  segments jsonb,
  CONSTRAINT transcriptions_pkey PRIMARY KEY (id),
  CONSTRAINT transcriptions_audio_id_fkey FOREIGN KEY (audio_id) REFERENCES public.audios(id),
  CONSTRAINT transcriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);