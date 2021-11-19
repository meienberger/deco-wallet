import { Field, ID, ObjectType } from '@nestjs/graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import ChainAddress from '../chain-address/chain-address.entity';
import Invoice from '../invoice/invoice.entity';

@ObjectType()
@Entity()
export default class User extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String, { nullable: true })
  @Column({ unique: true, nullable: true })
  firebaseUid?: string;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Column({ nullable: true })
  password?: string;

  @OneToMany(() => Invoice, invoice => invoice.user)
  invoices?: Invoice[];

  @OneToMany(() => ChainAddress, chainAddress => chainAddress.address)
  chainAddresses?: ChainAddress[];

  @Field(() => Date)
  @CreateDateColumn()
  createdAt!: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt!: Date;
}
