import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Driver } from './Driver';

@Entity()
export class Advance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column('varchar', { default: '$' })
  currency!: '$' | 'USD' | 'R$';

  @Column('date')
  date!: Date;

  @Column('boolean', { default: false })
  isIncludedInLiquidation!: boolean;

  @ManyToOne('Driver', 'advances')
  @JoinColumn({ name: 'driverId' })
  driver!: Driver;

  @Column('int')
  driverId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}