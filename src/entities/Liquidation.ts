import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Driver } from './Driver';
import { Trip } from './Trip';
import { Advance } from './Advance';

@Entity()
export class Liquidation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  date!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountUSD!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountUYU!: number; // Peso uruguayo ($)

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amountBRL!: number; // Real brasileño (R$)

  @Column({ default: 'pending' })
  status!: 'pending' | 'paid' | 'canceled';

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @ManyToOne(() => Driver, driver => driver.liquidations)
  @JoinColumn({ name: 'driverId' })
  driver!: Driver;

  @Column()
  driverId!: number;

  @ManyToMany(() => Trip)
  @JoinTable({
    name: 'liquidation_trips',
    joinColumn: { name: 'liquidationId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tripId', referencedColumnName: 'id' }
  })
  trips!: Trip[];

  @ManyToMany(() => Advance)
  @JoinTable({
    name: 'liquidation_advances',
    joinColumn: { name: 'liquidationId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'advanceId', referencedColumnName: 'id' }
  })
  advances!: Advance[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Computed properties for totals
  get totalAdvancesUSD(): number {
    return this.advances?.filter(a => a.currency === 'USD').reduce((sum, a) => sum + Number(a.amount), 0) || 0;
  }

  get totalAdvancesUYU(): number {
    return this.advances?.filter(a => a.currency === '$').reduce((sum, a) => sum + Number(a.amount), 0) || 0;
  }

  get totalAdvancesBRL(): number {
    return this.advances?.filter(a => a.currency === 'R$').reduce((sum, a) => sum + Number(a.amount), 0) || 0;
  }

  get balanceUSD(): number {
    return this.amountUSD - this.totalAdvancesUSD;
  }

  get balanceUYU(): number {
    return this.amountUYU - this.totalAdvancesUYU;
  }

  get balanceBRL(): number {
    return this.amountBRL - this.totalAdvancesBRL;
  }
}