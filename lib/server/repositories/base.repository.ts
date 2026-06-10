// @ts-nocheck
import {
  Repository,
  SelectQueryBuilder,
  ObjectLiteral,
  UpdateResult,
  FindOptionsWhere,
} from "typeorm";

export class BaseRepository<Entity extends ObjectLiteral> extends Repository<Entity> {
  async update(
    criteria:
      | string
      | string[]
      | number
      | number[]
      | Date
      | Date[]
      | FindOptionsWhere<Entity>
      | FindOptionsWhere<Entity>[],
    partialEntity: Record<string, unknown>,
  ): Promise<UpdateResult> {
    const hasUpdatedAt = this.metadata.findColumnWithPropertyName("updatedAt");
    const entityToUpdate = hasUpdatedAt
      ? { ...partialEntity, updatedAt: new Date() }
      : partialEntity;
    return super.update(criteria, entityToUpdate);
  }

  async save<T extends Entity>(entity: T): Promise<T> {
    const hasCreatedAt = this.metadata.findColumnWithPropertyName("createdAt");
    if (hasCreatedAt && !(entity as Record<string, unknown>)["createdAt"]) {
      (entity as Record<string, unknown>)["createdAt"] = new Date();
    }
    return super.save(entity);
  }

  protected withCount<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    relation: string,
    alias: string,
    conditions?: (qb: SelectQueryBuilder<ObjectLiteral>) => void,
    relationAlias?: string,
  ): SelectQueryBuilder<T> {
    const relAlias = relationAlias || relation.replace(/s$/, "");
    const mainAlias = queryBuilder.alias;

    queryBuilder.addSelect((subQuery) => {
      const countQuery = subQuery
        .select(`COUNT(${relAlias}.id)`)
        .from(`${mainAlias}.${relation}`, relAlias);

      if (conditions) {
        conditions(countQuery);
      }

      return countQuery;
    }, alias);

    return queryBuilder;
  }

  protected withCountEntity<T extends ObjectLiteral, E extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    entityClass: new () => E,
    alias: string,
    conditions: (qb: SelectQueryBuilder<E>) => void,
    entityAlias = "entity",
  ): SelectQueryBuilder<T> {
    queryBuilder.addSelect((subQuery) => {
      const countQuery = subQuery
        .select(`COUNT(${entityAlias}.id)`)
        .from(entityClass, entityAlias) as SelectQueryBuilder<E>;

      conditions(countQuery);

      return countQuery;
    }, alias);

    return queryBuilder;
  }
}
