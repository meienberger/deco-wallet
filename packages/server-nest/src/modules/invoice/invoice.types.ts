import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { ErrorResponse } from '../../types/error.types';
import Invoice from './invoice.entity';

@ObjectType()
class InvoiceResponse extends ErrorResponse {
  @Field(() => Invoice, { nullable: true })
  invoice?: Invoice;
}

@InputType()
class CreateInvoiceInput {
  @Field({ nullable: false })
  amount!: number;

  @Field({ nullable: false })
  description!: string;
}

enum InvoiceTypeEnum {
  RECEIVE = 'receive',
  SEND = 'send',
}

export { InvoiceResponse, CreateInvoiceInput, InvoiceTypeEnum };
