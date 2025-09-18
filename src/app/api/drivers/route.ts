import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDataSource } from '@/lib/db/config';
import { Driver } from '@/entities/Driver';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const driverRepository = dataSource.getRepository(Driver);
    
    const drivers = await driverRepository.find({
      select: ['id', 'name', 'document', 'contact', 'email', 'role', 'createdAt']
    });

    return NextResponse.json(drivers);
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, document, contact, email, password, role } = await request.json();

    if (!name || !document || !contact) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const driverRepository = dataSource.getRepository(Driver);

    // Check if driver already exists
    const existingDriver = await driverRepository.findOne({ where: { document } });
    if (existingDriver) {
      return NextResponse.json({ error: 'Driver with this document already exists' }, { status: 400 });
    }

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 12);
    }

    const driver = driverRepository.create({
      name,
      document,
      contact,
      email,
      hashedPassword,
      role: role || 'driver'
    });

    await driverRepository.save(driver);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword: _pwd, ...driverResponse } = driver;
    return NextResponse.json(driverResponse, { status: 201 });
  } catch (error) {
    console.error('Error creating driver:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}