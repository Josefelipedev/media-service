import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../infra/database/database.service';
import { NewMedia, media } from '../../infra/database/schema';
import { MediaEntity } from './entities/media.entity';
import { and, asc, desc, eq, isNull, sql, type SQL } from 'drizzle-orm';

type MediaWhere = {
  ownerId?: string;
  ownerType?: string;
  app?: string;
  deletedAt?: null | Date;
};

type MediaOrderBy = {
  createdAt?: 'asc' | 'desc';
};

type MediaUpdate = Partial<NewMedia>;

@Injectable()
export class MediaRepository {
  constructor(private database: DatabaseService) {}

  async create(data: NewMedia): Promise<MediaEntity> {
    const [row] = await this.database.db.insert(media).values(data).returning();
    return new MediaEntity(row);
  }

  async findById(id: string): Promise<MediaEntity | null> {
    const [row] = await this.database.db
      .select()
      .from(media)
      .where(and(eq(media.id, id), isNull(media.deletedAt)));
    return row ? new MediaEntity(row) : null;
  }

  async findAll(params: {
    where?: MediaWhere;
    skip?: number;
    take?: number;
    orderBy?: MediaOrderBy;
  }): Promise<MediaEntity[]> {
    const whereClause = this.buildWhere(params.where);
    let query = this.database.db.select().from(media).$dynamic();

    if (whereClause) {
      query = query.where(whereClause);
    }

    if (params.orderBy?.createdAt) {
      query = query.orderBy(
        params.orderBy.createdAt === 'desc'
          ? desc(media.createdAt)
          : asc(media.createdAt),
      );
    }

    if (params.take) {
      query = query.limit(params.take);
    }

    if (params.skip) {
      query = query.offset(params.skip);
    }

    const rows = await query;
    return rows.map((row) => new MediaEntity(row));
  }

  async count(where: MediaWhere): Promise<number> {
    const whereClause = this.buildWhere(where);
    const query = this.database.db
      .select({ count: sql<number>`count(*)` })
      .from(media);

    const [row] = whereClause ? await query.where(whereClause) : await query;
    return Number(row?.count ?? 0);
  }

  async update(id: string, data: MediaUpdate): Promise<MediaEntity> {
    const [row] = await this.database.db
      .update(media)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(media.id, id))
      .returning();
    return new MediaEntity(row);
  }

  async softDelete(id: string): Promise<MediaEntity> {
    const [row] = await this.database.db
      .update(media)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(media.id, id))
      .returning();
    return new MediaEntity(row);
  }

  async delete(id: string): Promise<void> {
    await this.database.db.delete(media).where(eq(media.id, id));
  }

  async softDeleteAllByOwner(
    ownerId: string,
    ownerType: string,
  ): Promise<number> {
    const rows = await this.database.db
      .update(media)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(media.ownerId, ownerId),
          eq(media.ownerType, ownerType),
          isNull(media.deletedAt),
        ),
      )
      .returning({ id: media.id });
    return rows.length;
  }

  private buildWhere(where?: MediaWhere) {
    const conditions: SQL[] = [];

    if (!where || !('deletedAt' in where) || where.deletedAt === null) {
      conditions.push(isNull(media.deletedAt));
    }

    if (where?.ownerId) {
      conditions.push(eq(media.ownerId, where.ownerId));
    }

    if (where?.ownerType) {
      conditions.push(eq(media.ownerType, where.ownerType));
    }

    if (where?.app) {
      conditions.push(eq(media.app, where.app));
    }

    return conditions.length ? and(...conditions) : undefined;
  }
}
