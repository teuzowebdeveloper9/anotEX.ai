import type {
  CreateGroupProps,
  GroupMemberEntity,
  GroupShareEntity,
  GroupWithMemberCount,
  StudyGroupEntity,
} from '../entities/study-group.entity.js';

export const STUDY_GROUP_REPOSITORY = Symbol('IStudyGroupRepository');

export interface IStudyGroupRepository {
  createGroup(props: CreateGroupProps): Promise<StudyGroupEntity>;
  findGroupById(id: string): Promise<StudyGroupEntity | null>;
  findGroupsByUserId(userId: string): Promise<GroupWithMemberCount[]>;
  updateGroup(id: string, name: string, description: string | null): Promise<StudyGroupEntity>;
  deleteGroup(id: string): Promise<void>;

  addMember(groupId: string, userId: string, role?: 'owner' | 'member'): Promise<GroupMemberEntity>;
  findMember(groupId: string, userId: string): Promise<GroupMemberEntity | null>;
  findMembers(groupId: string): Promise<GroupMemberEntity[]>;
  removeMember(groupId: string, userId: string): Promise<void>;

  addShare(groupId: string, sharedLinkId: string, sharedBy: string): Promise<GroupShareEntity>;
  findShares(groupId: string): Promise<GroupShareEntity[]>;
  removeShare(groupId: string, sharedLinkId: string): Promise<void>;
  findUserIdByEmail(email: string): Promise<string | null>;
}
