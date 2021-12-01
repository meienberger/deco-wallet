/* eslint-disable import/no-cycle */
import { Field, ID, ObjectType } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { TypeormLoader } from 'type-graphql-dataloader';
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

  @Field(() => ChainAddress, { nullable: true })
  @OneToOne(() => ChainAddress, chainAddress => chainAddress.user)
  @JoinColumn()
  @TypeormLoader()
  chainAddress?: ChainAddress;

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
