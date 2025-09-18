import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDataSource } from '@/lib/db/config';
import { Advance } from '@/entities/Advance';

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
    const advanceRepository = dataSource.getRepository(Advance);

    const advance = await advanceRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['driver']
    });

    if (!advance) {
      return NextResponse.json({ error: 'Advance not found' }, { status: 404 });
    }

    // If user is driver, only show their advances
    if (session.user.role === 'driver' && advance.driver.document !== session.user.document) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(advance);
  } catch (error) {
    console.error('Error fetching advance:', error);
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

    const { amount, currency, date } = await request.json();

    if (!amount || !currency || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const advanceRepository = dataSource.getRepository(Advance);

    const advance = await advanceRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!advance) {
      return NextResponse.json({ error: 'Advance not found' }, { status: 404 });
    }

    // Update advance fields
    advance.amount = amount;
    advance.currency = currency;
    advance.date = new Date(date);

    await advanceRepository.save(advance);

    // Fetch the updated advance with relations
    const updatedAdvance = await advanceRepository.findOne({
      where: { id: advance.id },
      relations: ['driver']
    });

    return NextResponse.json(updatedAdvance);
  } catch (error) {
    console.error('Error updating advance:', error);
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
    const advanceRepository = dataSource.getRepository(Advance);

    const advance = await advanceRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!advance) {
      return NextResponse.json({ error: 'Advance not found' }, { status: 404 });
    }

    await advanceRepository.remove(advance);

    return NextResponse.json({ message: 'Advance deleted successfully' });
  } catch (error) {
    console.error('Error deleting advance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}