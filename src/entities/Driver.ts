import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Trip } from './Trip';
import { Liquidation } from './Liquidation';
import { Advance } from './Advance';

@Entity()
export class Driver {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ unique: true })
  document!: string;

  @Column()
  contact!: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  hashedPassword?: string;

  @Column({ default: 'driver' })
  role!: 'admin' | 'driver';

  @OneToMany(() => Trip, trip => trip.driver)
  trips!: Trip[];

  @OneToMany(() => Liquidation, liquidation => liquidation.driver)
  liquidations!: Liquidation[];

  @OneToMany(() => Advance, advance => advance.driver)
  advances!: Advance[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}