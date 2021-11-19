import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceResolver } from './invoice.resolver';
import { UserModule } from '../user/user.module';

@Module({
  providers: [InvoiceService, InvoiceResolver],
  imports: [UserModule],
})
export class InvoiceModule {}
