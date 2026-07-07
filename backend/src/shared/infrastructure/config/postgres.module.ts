import { Global, Module } from '@nestjs/common';
import { PostgresService } from './postgres.config.js';

/**
 * Módulo global que provê o pool único de conexões do Postgres.
 * Por ser @Global(), o PostgresService fica disponível para injeção
 * em toda a aplicação sem precisar redeclarar em cada módulo —
 * evitando a criação de um pool por módulo.
 */
@Global()
@Module({
  providers: [PostgresService],
  exports: [PostgresService],
})
export class PostgresModule {}
