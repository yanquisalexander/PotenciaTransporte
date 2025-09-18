import { DataSource } from 'typeorm';
import { Driver } from '@/entities/Driver';
import { Provider } from '@/entities/Provider';
import { Trip } from '@/entities/Trip';
import { Liquidation } from '@/entities/Liquidation';
import { Advance } from '@/entities/Advance';

const isDevelopment = process.env.NODE_ENV === 'development';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: isDevelopment, // Only in development
  logging: isDevelopment,
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