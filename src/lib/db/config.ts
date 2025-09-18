import 'reflect-metadata';
import { config } from 'dotenv';
config({ path: '.env.local' });
import { DataSource } from 'typeorm';
import { Driver } from '@/entities/Driver';
import { Provider } from '@/entities/Provider';
import { Trip } from '@/entities/Trip';
import { Liquidation } from '@/entities/Liquidation';
import { Advance } from '@/entities/Advance';

console.log('DATABASE_URL:', process.env.DATABASE_URL);


export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: true, // Only in development
  logging: false,
  entities: [Driver, Provider, Trip, Liquidation, Advance],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

let initialized = false;

export async function getDataSource() {
  if (!initialized) {
    await AppDataSource.initialize();
    initialized = true;
  }
  return AppDataSource;
}