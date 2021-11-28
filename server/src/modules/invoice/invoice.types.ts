/* eslint-disable import/no-cycle */
/* eslint-disable max-classes-per-file */
import { ObjectType, Field, InputType, ArgsType, ID } from 'type-graphql';
import Invoice from './invoice.entity';
import { ErrorResponse } from '../../utils/error.types';
import { PaginationInfo } from '../common/types/pagination.types';

@ObjectType()
class InvoiceResponse extends ErrorResponse {
  @Field(() => Invoice, { nullable: true })
  invoice?: Invoice;
}

@ObjectType()
class PaginatedInvoicesResponse extends ErrorResponse {
  @Field(() => [Invoice], { nullable: true })
  invoices?: Invoice[];

  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo;
}

@InputType()
class CreateInvoiceInput {
  @Field({ nullable: false })
  amount!: number;

  @Field({ nullable: false })
  description!: string;
}

@ArgsType()
export class InvoiceUpdateArgs {
  @Field(() => ID)
  invoiceId!: number;
}

enum InvoiceTypeEnum {
  RECEIVE = 'receive',
  SEND = 'send',
}

export { InvoiceResponse, CreateInvoiceInput, InvoiceTypeEnum, PaginatedInvoicesResponse };
