/* eslint-disable import/no-cycle */
import { Field, ID, ObjectType } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { IsEmail } from 'class-validator';
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
  @IsEmail()
  @Column({ unique: true })
  username!: string;

  @Column({ nullable: true })
  password?: string;

  @OneToMany(() => Invoice, invoice => invoice.user)
  invoices?: Invoice[];

  @OneToMany(() => ChainAddress, chainAddress => chainAddress.address)
  chainAddresses?: ChainAddress[];

  @Field(() => Boolean)
  @Column({ default: false })
  verified!: boolean;

  // Used only for display purposes
  @Field(() => Number)
  @Column({ default: 0 })
  balance!: number;

  @Field(() => Date)
  @CreateDateColumn()
  lastBalanceUpdate!: Date;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt!: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt!: Date;
}
