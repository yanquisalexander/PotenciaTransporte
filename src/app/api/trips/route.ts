import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDataSource } from '@/lib/db/config';
import { Trip } from '@/entities/Trip';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');
    const providerId = searchParams.get('providerId');
    const isLiquidated = searchParams.get('isLiquidated');

    const dataSource = await getDataSource();
    const tripRepository = dataSource.getRepository(Trip);

    const query = tripRepository.createQueryBuilder('trip')
      .leftJoinAndSelect('trip.driver', 'driver')
      .leftJoinAndSelect('trip.provider', 'provider')
      .orderBy('trip.date', 'DESC');

    // Apply filters
    if (driverId) {
      query.andWhere('trip.driverId = :driverId', { driverId });
    }

    if (providerId) {
      query.andWhere('trip.providerId = :providerId', { providerId });
    }

    if (isLiquidated !== null) {
      query.andWhere('trip.isLiquidated = :isLiquidated', { isLiquidated: isLiquidated === 'true' });
    }

    // If user is driver, only show their trips
    if (session.user.role === 'driver') {
      const driverDoc = session.user.document;
      query.innerJoin('trip.driver', 'sessionDriver', 'sessionDriver.document = :document', { document: driverDoc });
    }

    const trips = await query.getMany();

    return NextResponse.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      date,
      origin,
      destination,
      providerId,
      driverId,
      originTons,
      destinationTons,
      directTons,
      notes,
      valuePerTon,
      currency,
      driverPercentage
    } = await request.json();

    if (!date || !origin || !destination || !providerId || !driverId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const tripRepository = dataSource.getRepository(Trip);

    // If user is driver, can only create trips for themselves
    if (session.user.role === 'driver') {
      const sessionDriverId = session.user.id;
      if (driverId.toString() !== sessionDriverId) {
        return NextResponse.json({ error: 'Drivers can only create trips for themselves' }, { status: 403 });
      }
    }

    const trip = tripRepository.create({
      date: new Date(date),
      origin,
      destination,
      providerId,
      driverId,
      originTons,
      destinationTons,
      directTons,
      notes,
      valuePerTon: valuePerTon || 0,
      currency: currency || '$',
      driverPercentage: driverPercentage || 100
    });

    await tripRepository.save(trip);

    // Fetch the trip with relations
    const savedTrip = await tripRepository.findOne({
      where: { id: trip.id },
      relations: ['driver', 'provider']
    });

    return NextResponse.json(savedTrip, { status: 201 });
  } catch (error) {
    console.error('Error creating trip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}