/* eslint-disable class-methods-use-this */
import { Arg, Args, Authorized, Ctx, Mutation, Query, Resolver, ResolverFilterData, Root, Subscription } from 'type-graphql';
import { MyContext } from '../../types';
import { CreateInvoiceInput, InvoiceResponse, InvoiceUpdateArgs, PaginatedInvoicesResponse, PayInvoiceResponse } from './invoice.types';
import InvoiceController from './invoice.controller';
import Invoice from './invoice.entity';
import PaginationInput from '../common/inputs/pagination.input';
import { Topic } from '../common/types/subscription.topics';

@Resolver()
export default class InvoiceResolver {
  @Authorized()
  @Mutation(() => InvoiceResponse)
  async createInvoice(@Arg('input') input: CreateInvoiceInput, @Ctx() { req }: MyContext): Promise<InvoiceResponse> {
    const { amount, description } = input;

    const { invoice, errors } = await InvoiceController.createInvoice({ amount, description, userId: req.session.userId || 0 });

    return { invoice, errors };
  }

  @Authorized()
  @Query(() => InvoiceResponse)
  async getInvoice(@Arg('invoiceId') invoiceId: number, @Ctx() { req }: MyContext): Promise<InvoiceResponse> {
    const { invoice, errors } = await InvoiceController.getInvoiceAndUpdate(invoiceId, req.session.userId || 0);

    return { invoice, errors };
  }

  @Authorized()
  @Query(() => PaginatedInvoicesResponse)
  paginatedInvoices(@Arg('pagination') pagination: PaginationInput, @Ctx() { req }: MyContext): Promise<PaginatedInvoicesResponse> {
    return InvoiceController.getUserInvoices(req.session.userId || 0, pagination);
  }

  @Authorized()
  @Mutation(() => PayInvoiceResponse)
  payInvoice(@Arg('paymentRequest') paymentRequest: string, @Ctx() { req }: MyContext): Promise<PayInvoiceResponse> {
    return InvoiceController.payInvoice(paymentRequest, req.session.userId || 0);
  }

  @Authorized()
  @Subscription(() => Invoice, {
    topics: Topic.InvoiceUpdate,
    filter: ({ payload, args, context }: ResolverFilterData<Invoice, InvoiceUpdateArgs, MyContext>) => {
      return Number(payload.id) === Number(args.invoiceId) && Number(payload.userId) === Number(context.req.session.userId);
    },
  })
  subscribeToInvoice(@Root() invoice: Invoice, @Args() { invoiceId }: InvoiceUpdateArgs): Invoice {
    if (invoiceId) {
      return invoice;
    }

    return invoice;
  }

  @Authorized()
  @Subscription(() => Invoice, {
    topics: Topic.AllInvoicesUpdate,
    filter: ({ payload, context }: ResolverFilterData<Invoice, null, MyContext>) => {
      return Number(payload.userId) === Number(context.req.session.userId);
    },
  })
  subscribeToAllInvoices(@Root() invoice: Invoice): Invoice {
    return invoice;
  }
}
