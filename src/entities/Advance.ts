import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Driver } from './Driver';

@Entity()
export class Advance {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ default: '$' })
  currency!: '$' | 'USD' | 'R$';

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column()
  date!: Date;

  @Column({ default: false })
  isIncludedInLiquidation!: boolean;

  @ManyToOne(() => Driver, driver => driver.advances)
  @JoinColumn({ name: 'driverId' })
  driver!: Driver;

  @Column()
  driverId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}