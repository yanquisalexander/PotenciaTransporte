import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDataSource } from '@/lib/db/config';
import { Liquidation } from '@/entities/Liquidation';
import { Trip } from '@/entities/Trip';
import { In } from 'typeorm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');
    const status = searchParams.get('status');

    const dataSource = await getDataSource();
    const liquidationRepository = dataSource.getRepository(Liquidation);

    const query = liquidationRepository.createQueryBuilder('liquidation')
      .leftJoinAndSelect('liquidation.driver', 'driver')
      .leftJoinAndSelect('liquidation.trips', 'trips')
      .leftJoinAndSelect('liquidation.advances', 'advances')
      .orderBy('liquidation.createdAt', 'DESC');

    // Apply filters
    if (driverId) {
      query.andWhere('liquidation.driverId = :driverId', { driverId });
    }

    if (status) {
      query.andWhere('liquidation.status = :status', { status });
    }

    // If user is driver, only show their liquidations
    if (session.user.role === 'driver') {
      const driverDoc = session.user.document;
      query.innerJoin('liquidation.driver', 'sessionDriver', 'sessionDriver.document = :document', { document: driverDoc });
    }

    const liquidations = await query.getMany();

    return NextResponse.json(liquidations);
  } catch (error) {
    console.error('Error fetching liquidations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      driverId,
      date,
      notes,
      tripIds,
      advanceIds
    } = await request.json();

    if (!driverId || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const liquidationRepository = dataSource.getRepository(Liquidation);
    const tripRepository = dataSource.getRepository(Trip);

    // Get trips for the liquidation
    let trips = [];
    if (tripIds && tripIds.length > 0) {
      trips = await tripRepository.find({
        where: { id: In(tripIds) },
        relations: ['driver', 'provider']
      });
    } else {
      // If no specific trips provided, get all unliquidated trips for the driver
      trips = await tripRepository.find({
        where: {
          driverId,
          isLiquidated: false
        },
        relations: ['driver', 'provider']
      });
    }

    if (trips.length === 0) {
      return NextResponse.json({ error: 'No trips found for liquidation' }, { status: 400 });
    }

    // Calculate totals by currency
    let amountUSD = 0;
    let amountUYU = 0;
    let amountBRL = 0;

    trips.forEach(trip => {
      const tons = trip.directTons || (trip.originTons || 0) - (trip.destinationTons || 0);
      const tripAmount = tons * trip.valuePerTon * (trip.driverPercentage / 100);
      
      switch (trip.currency) {
        case 'USD':
          amountUSD += tripAmount;
          break;
        case 'R$':
          amountBRL += tripAmount;
          break;
        default: // '$' (UYU)
          amountUYU += tripAmount;
          break;
      }
    });

    const liquidation = liquidationRepository.create({
      driverId,
      date: new Date(date),
      amountUSD,
      amountUYU,
      amountBRL,
      notes,
      status: 'pending'
    });

    await liquidationRepository.save(liquidation);

    // Associate trips with liquidation and mark as liquidated
    for (const trip of trips) {
      trip.isLiquidated = true;
      await tripRepository.save(trip);
    }

    // Set the trips and advances relations
    liquidation.trips = trips;
    if (advanceIds && advanceIds.length > 0) {
      // TODO: Handle advances when advance routes are implemented
    }

    await liquidationRepository.save(liquidation);

    // Fetch the complete liquidation with relations
    const savedLiquidation = await liquidationRepository.findOne({
      where: { id: liquidation.id },
      relations: ['driver', 'trips', 'advances']
    });

    return NextResponse.json(savedLiquidation, { status: 201 });
  } catch (error) {
    console.error('Error creating liquidation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}