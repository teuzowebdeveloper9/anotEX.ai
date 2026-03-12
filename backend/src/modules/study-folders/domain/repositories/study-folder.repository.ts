import type {
  AddItemProps,
  CreateFolderProps,
  FolderItemType,
  StudyFolderEntity,
  StudyFolderItemEntity,
} from '../entities/study-folder.entity.js';

export interface IStudyFolderRepository {
  create(props: CreateFolderProps): Promise<StudyFolderEntity>;
  findById(id: string): Promise<StudyFolderEntity | null>;
  findByUserId(userId: string): Promise<StudyFolderEntity[]>;
  update(
    id: string,
    data: { name?: string; description?: string | null },
  ): Promise<StudyFolderEntity>;
  deleteById(id: string): Promise<void>;

  addItem(props: AddItemProps): Promise<StudyFolderItemEntity>;
  removeItem(itemId: string): Promise<void>;
  findItemsByFolderId(folderId: string): Promise<StudyFolderItemEntity[]>;
  findItemById(itemId: string): Promise<StudyFolderItemEntity | null>;
  itemExists(
    folderId: string,
    transcriptionId: string,
    itemType: FolderItemType,
  ): Promise<boolean>;
}

export const STUDY_FOLDER_REPOSITORY = Symbol('IStudyFolderRepository');
