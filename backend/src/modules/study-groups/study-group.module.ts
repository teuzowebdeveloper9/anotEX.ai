import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from '../../shared/infrastructure/config/supabase.config.js';
import { StudyGroupController } from './presentation/controllers/study-group.controller.js';
import { CreateGroupUseCase } from './domain/use-cases/create-group.use-case.js';
import { GetUserGroupsUseCase } from './domain/use-cases/get-user-groups.use-case.js';
import { AddGroupMemberUseCase } from './domain/use-cases/add-group-member.use-case.js';
import { RemoveGroupMemberUseCase } from './domain/use-cases/remove-group-member.use-case.js';
import { ShareToGroupUseCase } from './domain/use-cases/share-to-group.use-case.js';
import { GetGroupDetailUseCase } from './domain/use-cases/get-group-detail.use-case.js';
import { DeleteGroupUseCase } from './domain/use-cases/delete-group.use-case.js';
import { RemoveGroupShareUseCase } from './domain/use-cases/remove-group-share.use-case.js';
import { UpdateGroupUseCase } from './domain/use-cases/update-group.use-case.js';
import { StudyGroupRepositoryImpl } from './infrastructure/repositories/study-group.repository.impl.js';
import { STUDY_GROUP_REPOSITORY } from './domain/repositories/study-group.repository.js';
import { SHARE_LINK_REPOSITORY } from '../sharing/domain/repositories/share-link.repository.js';
import { ShareLinkRepositoryImpl } from '../sharing/infrastructure/repositories/share-link.repository.impl.js';

@Module({
  imports: [ConfigModule],
  controllers: [StudyGroupController],
  providers: [
    SupabaseService,
    CreateGroupUseCase,
    GetUserGroupsUseCase,
    AddGroupMemberUseCase,
    RemoveGroupMemberUseCase,
    ShareToGroupUseCase,
    GetGroupDetailUseCase,
    DeleteGroupUseCase,
    RemoveGroupShareUseCase,
    UpdateGroupUseCase,
    { provide: STUDY_GROUP_REPOSITORY, useClass: StudyGroupRepositoryImpl },
    { provide: SHARE_LINK_REPOSITORY, useClass: ShareLinkRepositoryImpl },
  ],
})
export class StudyGroupModule {}
