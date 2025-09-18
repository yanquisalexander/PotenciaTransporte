import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm';
import { Trip } from './Trip';

@Entity()
export class Provider extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar')
  name!: string;

  @Column('varchar', { unique: true })
  taxId!: string; // RUT

  @Column('varchar')
  contact!: string;

  @OneToMany('Trip', 'provider')
  trips!: Trip[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}