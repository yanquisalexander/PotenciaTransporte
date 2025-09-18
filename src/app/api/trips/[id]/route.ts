import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDataSource } from '@/lib/db/config';
import { Trip } from '@/entities/Trip';

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
    const tripRepository = dataSource.getRepository(Trip);

    const trip = await tripRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['driver', 'provider']
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // If user is driver, only show their trips
    if (session.user.role === 'driver' && trip.driver.document !== session.user.document) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
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

    const trip = await tripRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['driver']
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // If user is driver, can only update their own trips
    if (session.user.role === 'driver') {
      if (trip.driver.document !== session.user.document) {
        return NextResponse.json({ error: 'Drivers can only update their own trips' }, { status: 403 });
      }
      // Drivers cannot change the driver assignment
      if (driverId.toString() !== session.user.id) {
        return NextResponse.json({ error: 'Drivers cannot change driver assignment' }, { status: 403 });
      }
    }

    // Update trip fields
    trip.date = new Date(date);
    trip.origin = origin;
    trip.destination = destination;
    trip.providerId = providerId;
    trip.driverId = driverId;
    trip.originTons = originTons;
    trip.destinationTons = destinationTons;
    trip.directTons = directTons;
    trip.notes = notes;
    trip.valuePerTon = valuePerTon || 0;
    trip.currency = currency || '$';
    trip.driverPercentage = driverPercentage || 100;

    await tripRepository.save(trip);

    // Fetch the updated trip with relations
    const updatedTrip = await tripRepository.findOne({
      where: { id: trip.id },
      relations: ['driver', 'provider']
    });

    return NextResponse.json(updatedTrip);
  } catch (error) {
    console.error('Error updating trip:', error);
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

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dataSource = await getDataSource();
    const tripRepository = dataSource.getRepository(Trip);

    const trip = await tripRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['driver']
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // If user is driver, can only delete their own trips
    if (session.user.role === 'driver' && trip.driver.document !== session.user.document) {
      return NextResponse.json({ error: 'Drivers can only delete their own trips' }, { status: 403 });
    }

    await tripRepository.remove(trip);

    return NextResponse.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}