/* eslint-disable import/no-cycle */
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import User from '../user/user.entity';

@ObjectType()
@Entity()
export default class ChainAddress extends BaseEntity {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  address!: string;

  @Field({ nullable: false })
  @Column()
  userId!: number;

  @ManyToOne(() => User, user => user.chainAddresses)
  user!: User;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt!: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt!: Date;
}
