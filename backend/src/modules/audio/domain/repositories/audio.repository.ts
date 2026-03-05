import { AudioEntity, AudioStatus, CreateAudioProps } from '../entities/audio.entity.js';

export interface IAudioRepository {
  create(props: CreateAudioProps): Promise<AudioEntity>;
  findById(id: string): Promise<AudioEntity | null>;
  findByUserId(userId: string): Promise<AudioEntity[]>;
  updateStatus(id: string, status: AudioStatus, errorMessage?: string): Promise<void>;
  delete(id: string): Promise<void>;
}

export const AUDIO_REPOSITORY = Symbol('IAudioRepository');
