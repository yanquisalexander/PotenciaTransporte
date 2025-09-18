import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDataSource } from '@/lib/db/config';
import { Provider } from '@/entities/Provider';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const providerRepository = dataSource.getRepository(Provider);

    const provider = await providerRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error fetching provider:', error);
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

    const { name, taxId, contact } = await request.json();

    if (!name || !taxId || !contact) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const providerRepository = dataSource.getRepository(Provider);

    const provider = await providerRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    // Check if taxId is already taken by another provider
    const existingProvider = await providerRepository.findOne({ 
      where: { taxId } 
    });
    if (existingProvider && existingProvider.id !== provider.id) {
      return NextResponse.json({ error: 'Provider with this tax ID already exists' }, { status: 400 });
    }

    // Update provider fields
    provider.name = name;
    provider.taxId = taxId;
    provider.contact = contact;

    await providerRepository.save(provider);

    return NextResponse.json(provider);
  } catch (error) {
    console.error('Error updating provider:', error);
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
    const providerRepository = dataSource.getRepository(Provider);

    const provider = await providerRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    await providerRepository.remove(provider);

    return NextResponse.json({ message: 'Provider deleted successfully' });
  } catch (error) {
    console.error('Error deleting provider:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}