/* eslint-disable import/no-cycle */
import { Field, ID, ObjectType } from 'type-graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@ObjectType()
@Entity()
export class Invoice extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  nativeId!: string;

  @Field()
  @Column({ default: false })
  isCanceled!: boolean;

  @Field()
  @Column({ default: false })
  isConfirmed!: boolean;

  @Field()
  @Column()
  description!: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  descriptionHash?: string;

  @Field()
  @Column()
  userId!: number;

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
