import { Field, ID, ObjectType } from '@nestjs/graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import User from '../user/user.entity';
import { InvoiceTypeEnum } from './invoice.types';

@ObjectType()
@Entity()
export default class Invoice extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  nativeId!: string;

  @Field({ nullable: false })
  @Column({ unique: true, nullable: false })
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
