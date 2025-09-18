import 'reflect-metadata';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Driver } from './Driver';
import { Provider } from './Provider';

@Entity()
export class Trip {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('date')
  date!: Date;

  @Column('varchar')
  origin!: string;

  @Column('varchar')
  destination!: string;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  originTons?: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  destinationTons?: number;

  @Column({ nullable: true, type: 'decimal', precision: 10, scale: 2 })
  directTons?: number;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  valuePerTon!: number;

  @Column('varchar', { default: '$' })
  currency!: '$' | 'USD' | 'R$';

  @Column('int')
  driverId!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  driverPercentage!: number;

  @Column('boolean', { default: false })
  isLiquidated!: boolean;

  @ManyToOne('Driver', 'trips')
  @JoinColumn({ name: 'driverId' })
  driver!: Driver;

  @ManyToOne('Provider', 'trips')
  @JoinColumn({ name: 'providerId' })
  provider!: Provider;

  @Column('int')
  providerId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Computed property for tons difference
  get tonsDifference(): number | null {
    if (this.originTons && this.destinationTons) {
      return this.originTons - this.destinationTons;
    }
    return null;
  }

  // Computed property for total tons
  get totalTons(): number {
    if (this.directTons) return this.directTons;
    if (this.tonsDifference) return Math.abs(this.tonsDifference);
    return this.originTons || this.destinationTons || 0;
  }

  // Computed property for subtotal
  get subtotal(): number {
    return this.totalTons * this.valuePerTon * (this.driverPercentage / 100);
  }
}