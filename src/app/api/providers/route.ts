import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDataSource } from '@/lib/db/config';
import { Provider } from '@/entities/Provider';

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const providerRepository = dataSource.getRepository(Provider);

    const providers = await providerRepository.find({
      order: { name: 'ASC' }
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, taxId, contact } = await request.json();

    if (!name || !taxId || !contact) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const providerRepository = dataSource.getRepository(Provider);

    // Check if provider already exists
    const existingProvider = await providerRepository.findOne({ where: { taxId } });
    if (existingProvider) {
      return NextResponse.json({ error: 'Provider with this tax ID already exists' }, { status: 400 });
    }

    const provider = providerRepository.create({
      name,
      taxId,
      contact
    });

    await providerRepository.save(provider);

    return NextResponse.json(provider, { status: 201 });
  } catch (error) {
    console.error('Error creating provider:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}