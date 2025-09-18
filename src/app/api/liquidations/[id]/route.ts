import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDataSource } from '@/lib/db/config';
import { Liquidation } from '@/entities/Liquidation';

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
    const liquidationRepository = dataSource.getRepository(Liquidation);

    const liquidation = await liquidationRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['driver', 'trips', 'advances']
    });

    if (!liquidation) {
      return NextResponse.json({ error: 'Liquidation not found' }, { status: 404 });
    }

    // If user is driver, only show their liquidations
    if (session.user.role === 'driver' && liquidation.driver.document !== session.user.document) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(liquidation);
  } catch (error) {
    console.error('Error fetching liquidation:', error);
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

    const { notes, status } = await request.json();

    const dataSource = await getDataSource();
    const liquidationRepository = dataSource.getRepository(Liquidation);

    const liquidation = await liquidationRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!liquidation) {
      return NextResponse.json({ error: 'Liquidation not found' }, { status: 404 });
    }

    // Update liquidation fields
    if (notes !== undefined) liquidation.notes = notes;
    if (status !== undefined) liquidation.status = status;

    await liquidationRepository.save(liquidation);

    // Fetch the updated liquidation with relations
    const updatedLiquidation = await liquidationRepository.findOne({
      where: { id: liquidation.id },
      relations: ['driver', 'trips', 'advances']
    });

    return NextResponse.json(updatedLiquidation);
  } catch (error) {
    console.error('Error updating liquidation:', error);
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
    const liquidationRepository = dataSource.getRepository(Liquidation);

    const liquidation = await liquidationRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['trips']
    });

    if (!liquidation) {
      return NextResponse.json({ error: 'Liquidation not found' }, { status: 404 });
    }

    // Mark associated trips as not liquidated
    if (liquidation.trips) {
      const tripRepository = dataSource.getRepository('Trip');
      for (const trip of liquidation.trips) {
        trip.isLiquidated = false;
        await tripRepository.save(trip);
      }
    }

    await liquidationRepository.remove(liquidation);

    return NextResponse.json({ message: 'Liquidation deleted successfully' });
  } catch (error) {
    console.error('Error deleting liquidation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}