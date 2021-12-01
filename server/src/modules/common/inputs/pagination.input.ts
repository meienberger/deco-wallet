import { Field, InputType } from 'type-graphql';

@InputType()
class PaginationInput {
  @Field()
  page!: number;

  @Field()
  pageSize!: number;
}

export default PaginationInput;
