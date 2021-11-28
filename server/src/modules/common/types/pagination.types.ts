import { Field, ObjectType } from 'type-graphql';

@ObjectType()
class PaginationInfo {
  @Field({ nullable: false })
  totalDocuments!: number;

  @Field({ nullable: false })
  totalPages!: number;

  @Field({ nullable: false })
  page!: number;

  @Field({ nullable: false })
  hasNextPage!: boolean;

  @Field({ nullable: true })
  nextPage?: number;
}

const formatPaginationInfo = (count: number, page: number, pageSize: number): PaginationInfo => {
  const totalPages = Math.ceil(count / pageSize);
  const hasNextPage = Boolean(page < totalPages);
  const nextPage = hasNextPage ? page + 1 : undefined;

  return { totalDocuments: count, totalPages, hasNextPage, nextPage, page };
};

export { PaginationInfo, formatPaginationInfo };
