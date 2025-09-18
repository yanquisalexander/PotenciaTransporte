import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDataSource } from '@/lib/db/config';
import { Advance } from '@/entities/Advance';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');
    const isIncludedInLiquidation = searchParams.get('isIncludedInLiquidation');

    const dataSource = await getDataSource();
    const advanceRepository = dataSource.getRepository(Advance);

    const query = advanceRepository.createQueryBuilder('advance')
      .leftJoinAndSelect('advance.driver', 'driver')
      .orderBy('advance.date', 'DESC');

    // Apply filters
    if (driverId) {
      query.andWhere('advance.driverId = :driverId', { driverId });
    }

    if (isIncludedInLiquidation !== null) {
      query.andWhere('advance.isIncludedInLiquidation = :isIncludedInLiquidation', { 
        isIncludedInLiquidation: isIncludedInLiquidation === 'true' 
      });
    }

    // If user is driver, only show their advances
    if (session.user.role === 'driver') {
      const driverDoc = session.user.document;
      query.innerJoin('advance.driver', 'sessionDriver', 'sessionDriver.document = :document', { document: driverDoc });
    }

    const advances = await query.getMany();

    return NextResponse.json(advances);
  } catch (error) {
    console.error('Error fetching advances:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, currency, date, driverId } = await request.json();

    if (!amount || !currency || !date || !driverId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const advanceRepository = dataSource.getRepository(Advance);

    const advance = advanceRepository.create({
      amount,
      currency,
      date: new Date(date),
      driverId,
      isIncludedInLiquidation: false
    });

    await advanceRepository.save(advance);

    // Fetch the advance with relations
    const savedAdvance = await advanceRepository.findOne({
      where: { id: advance.id },
      relations: ['driver']
    });

    return NextResponse.json(savedAdvance, { status: 201 });
  } catch (error) {
    console.error('Error creating advance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}