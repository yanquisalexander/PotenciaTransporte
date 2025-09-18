import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDataSource } from '@/lib/db/config';
import { Driver } from '@/entities/Driver';
import bcrypt from 'bcryptjs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const driverRepository = dataSource.getRepository(Driver);

    const driver = await driverRepository.findOne({
      where: { id: parseInt(id) },
      select: ['id', 'name', 'document', 'contact', 'email', 'role', 'createdAt']
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    return NextResponse.json(driver);
  } catch (error) {
    console.error('Error fetching driver:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const driver = await driverRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    // Check if document is already taken by another driver
    const existingDriver = await driverRepository.findOne({ 
      where: { document } 
    });
    if (existingDriver && existingDriver.id !== driver.id) {
      return NextResponse.json({ error: 'Driver with this document already exists' }, { status: 400 });
    }

    // Update driver fields
    driver.name = name;
    driver.document = document;
    driver.contact = contact;
    driver.email = email;
    driver.role = role || driver.role;

    // Update password if provided
    if (password) {
      driver.hashedPassword = await bcrypt.hash(password, 12);
    }

    await driverRepository.save(driver);

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword: _pwd, ...driverResponse } = driver;
    return NextResponse.json(driverResponse);
  } catch (error) {
    console.error('Error updating driver:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const driverRepository = dataSource.getRepository(Driver);

    const driver = await driverRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 });
    }

    await driverRepository.remove(driver);

    return NextResponse.json({ message: 'Driver deleted successfully' });
  } catch (error) {
    console.error('Error deleting driver:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}