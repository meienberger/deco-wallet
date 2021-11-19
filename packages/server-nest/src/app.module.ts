import path from 'path';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { ChainAddressModule } from './modules/chain-address/chain-address.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from './config';
import { MyContext } from './types';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: path.join(process.cwd(), 'src/schema.gql'),
      context: ({ req, res }): MyContext => ({ req, res }),
      playground: {
        settings: { 'request.credentials': 'include' },
      },
    }),
    TypeOrmModule.forRoot(config.typeorm),
    UserModule,
    ChainAddressModule,
    InvoiceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
