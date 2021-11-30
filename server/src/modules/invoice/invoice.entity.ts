/* eslint-disable import/no-cycle */
import { Field, ID, ObjectType } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { InvoiceTypeEnum } from './invoice.types';
import User from '../user/user.entity';

@ObjectType()
@Entity()
export default class Invoice extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  readonly id!: number;

  @Field()
  @Column()
  nativeId!: string;

  @Field({ nullable: false })
  @Column({ nullable: false })
  request!: string;

  @Field()
  @Column({ default: false })
  isCanceled!: boolean;

  @Field({ nullable: false })
  @Column({ nullable: false, enum: InvoiceTypeEnum })
  type!: InvoiceTypeEnum;

  @Field()
  @Column({ default: false })
  isConfirmed!: boolean;

  @Field({ nullable: false })
  @Column({ nullable: false })
  description!: string;

  @Field({ nullable: false })
  @Column({ nullable: false })
  amount!: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  fee?: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  descriptionHash?: string;

  @Field()
  @Column()
  userId!: number;

  @Field(() => User)
  @ManyToOne(() => User, user => user.invoices)
  user!: User;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  confirmedAt?: Date;

  @Field(() => Date)
  @CreateDateColumn()
  expiresAt!: Date;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt!: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt!: Date;
}

export { InvoiceTypeEnum };
