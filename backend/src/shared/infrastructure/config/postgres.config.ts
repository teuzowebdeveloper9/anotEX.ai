import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pg from 'pg';

/**
 * Pool único de conexões com o Azure Database for PostgreSQL.
 * Substitui o SupabaseService — repositórios usam query() com SQL parametrizado.
 */
@Injectable()
export class PostgresService implements OnModuleDestroy {
  private readonly logger = new Logger(PostgresService.name);
  private readonly pool: pg.Pool;

  constructor(configService: ConfigService) {
    this.pool = new pg.Pool({
      connectionString: configService.getOrThrow<string>('DATABASE_URL'),
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });

    this.pool.on('error', (err) => {
      this.logger.error(`Postgres pool error: ${err.message}`);
    });
  }

  async query<T extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<pg.QueryResult<T>> {
    return this.pool.query<T>(text, params as never[]);
  }

  /** Para transações: sempre liberar o client com release() em finally */
  async getClient(): Promise<pg.PoolClient> {
    return this.pool.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
