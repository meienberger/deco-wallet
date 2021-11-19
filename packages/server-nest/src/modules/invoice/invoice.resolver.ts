import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MyContext } from '../../types';
import ErrorHelpers from '../../utils/error-helpers';
import Invoice from './invoice.entity';
import { InvoiceService } from './invoice.service';
import { InvoiceResponse, CreateInvoiceInput } from './invoice.types';

@Resolver(() => Invoice)
export class InvoiceResolver {
  constructor(private invoiceService: InvoiceService) {}

  @Mutation(() => InvoiceResponse)
  async createInvoice(@Args('input') input: CreateInvoiceInput, @Context() { req }: MyContext): Promise<InvoiceResponse> {
    try {
      const { amount, description } = input;

      const { invoice, errors } = await this.invoiceService.createInvoice({ amount, description, userId: req.session.userId || 0 });

      return { invoice, errors };
    } catch (error) {
      return ErrorHelpers.handleErrors(error);
    }
  }

  @Query(() => InvoiceResponse)
  async getInvoice(@Args('invoiceId') invoiceId: number, @Context() { req }: MyContext): Promise<InvoiceResponse> {
    try {
      // TODO: Is logged in, is owner of invoice

      const { invoice, errors } = await this.invoiceService.getInvoiceAndUpdate(invoiceId, req.session.userId || 0);

      return { invoice, errors };
    } catch (error) {
      return ErrorHelpers.handleErrors(error);
    }
  }
}
