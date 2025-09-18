import 'reflect-metadata';
import { getDataSource } from '../src/lib/db/config';
import { Driver } from '../src/entities/Driver';
import { Provider } from '../src/entities/Provider';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('Connecting to database...');
    const dataSource = await getDataSource();
    console.log('Connected successfully!');

    // Create admin user
    const driverRepository = dataSource.getRepository(Driver);
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminExists = await driverRepository.findOne({ where: { document: 'admin' } });
    if (!adminExists) {
      const admin = driverRepository.create({
        name: 'Administrador',
        document: 'admin',
        contact: 'admin@potencia.com',
        email: 'admin@potencia.com',
        hashedPassword,
        role: 'admin'
      });
      await driverRepository.save(admin);
      console.log('Admin user created: document="admin", password="admin123"');
    }

    // Create sample driver
    const driverExists = await driverRepository.findOne({ where: { document: '12345678' } });
    if (!driverExists) {
      const driverPassword = await bcrypt.hash('driver123', 12);
      const driver = driverRepository.create({
        name: 'Juan Pérez',
        document: '12345678',
        contact: '+598 99 123 456',
        email: 'juan@example.com',
        hashedPassword: driverPassword,
        role: 'driver'
      });
      await driverRepository.save(driver);
      console.log('Sample driver created: document="12345678", password="driver123"');
    }

    // Create sample providers
    const providerRepository = dataSource.getRepository(Provider);
    
    const sampleProviders = [
      { name: 'Empresa A', taxId: '123456789012', contact: '+598 2 123 4567' },
      { name: 'Empresa B', taxId: '987654321098', contact: '+598 2 987 6543' },
      { name: 'Empresa C', taxId: '456789123456', contact: '+598 2 456 7891' }
    ];

    for (const providerData of sampleProviders) {
      const exists = await providerRepository.findOne({ where: { taxId: providerData.taxId } });
      if (!exists) {
        const provider = providerRepository.create(providerData);
        await providerRepository.save(provider);
        console.log(`Provider created: ${providerData.name}`);
      }
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();