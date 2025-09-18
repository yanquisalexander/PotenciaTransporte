import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Trip } from './Trip';
import { Liquidation } from './Liquidation';
import { Advance } from './Advance';

@Entity()
export class Driver {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar')
  name!: string;

  @Column('varchar', { unique: true })
  document!: string;

  @Column('varchar')
  contact!: string;

  @Column('varchar', { nullable: true })
  email?: string;

  @Column('varchar', { nullable: true })
  hashedPassword?: string;

  @Column('varchar', { default: 'driver' })
  role!: 'admin' | 'driver';

  @OneToMany('Trip', 'driver')
  trips!: Trip[];

  @OneToMany('Liquidation', 'driver')
  liquidations!: Liquidation[];

  @OneToMany('Advance', 'driver')
  advances!: Advance[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}