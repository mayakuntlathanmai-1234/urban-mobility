import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database for Urban Ride Mobility...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Seed Fare Configurations
  const fareConfigs = [
    { vehicleType: 'BIKE', baseFare: 30.0, perKmFare: 10.0, perMinFare: 1.5, minFare: 30.0, capacity: 1, description: 'Fast & affordable 1-seater bike ride' },
    { vehicleType: 'AUTO', baseFare: 40.0, perKmFare: 14.0, perMinFare: 2.0, minFare: 40.0, capacity: 3, description: 'Iconic 3-wheeler for quick city trips' },
    { vehicleType: 'SEDAN', baseFare: 60.0, perKmFare: 18.0, perMinFare: 2.5, minFare: 60.0, capacity: 4, description: 'Comfortable 4-seater sedan with AC' },
    { vehicleType: 'SUV', baseFare: 80.0, perKmFare: 22.0, perMinFare: 3.0, minFare: 80.0, capacity: 6, description: 'Spacious 6-seater SUV for group travels' }
  ];

  for (const fc of fareConfigs) {
    await prisma.fareConfig.upsert({
      where: { vehicleType: fc.vehicleType },
      update: fc,
      create: fc
    });
  }

  // 2. Seed Demo Passenger
  const passengerUser = await prisma.user.upsert({
    where: { email: 'passenger@urbanride.com' },
    update: { password: hashedPassword },
    create: {
      name: 'Ravi Teja',
      email: 'passenger@urbanride.com',
      password: hashedPassword,
      phone: '+91 98765 43210',
      role: 'PASSENGER'
    }
  });

  // 3. Seed Demo Admin
  await prisma.user.upsert({
    where: { email: 'admin@urbanride.com' },
    update: { password: hashedPassword },
    create: {
      name: 'System Admin',
      email: 'admin@urbanride.com',
      password: hashedPassword,
      phone: '+91 99999 00000',
      role: 'ADMIN'
    }
  });

  // 4. Seed Demo Drivers
  const driverUsers = [
    {
      name: 'Rahul Kumar',
      email: 'driver@urbanride.com',
      phone: '+91 91234 56789',
      licenseNumber: 'DL-88291029',
      rating: 4.8,
      lat: 16.5062,
      lng: 80.6480,
      make: 'Hyundai',
      model: 'i20',
      color: 'White',
      plateNumber: 'AP 39 AB 1234',
      type: 'SEDAN',
      capacity: 4
    },
    {
      name: 'Venkatesh Rao',
      email: 'driver.bike@urbanride.com',
      phone: '+91 91234 56790',
      licenseNumber: 'DL-44829101',
      rating: 4.9,
      lat: 16.5120,
      lng: 80.6510,
      make: 'Hero',
      model: 'Splendor Plus',
      color: 'Black',
      plateNumber: 'AP 39 BK 9081',
      type: 'BIKE',
      capacity: 1
    },
    {
      name: 'Suresh Babu',
      email: 'driver.auto@urbanride.com',
      phone: '+91 91234 56791',
      licenseNumber: 'DL-55910293',
      rating: 4.7,
      lat: 16.5010,
      lng: 80.6420,
      make: 'Bajaj',
      model: 'RE Auto',
      color: 'Yellow-Green',
      plateNumber: 'AP 39 AT 5542',
      type: 'AUTO',
      capacity: 3
    },
    {
      name: 'Anil Reddy',
      email: 'driver.suv@urbanride.com',
      phone: '+91 91234 56792',
      licenseNumber: 'DL-77201934',
      rating: 4.9,
      lat: 16.5150,
      lng: 80.6440,
      make: 'Toyota',
      model: 'Innova Crysta',
      color: 'Silver',
      plateNumber: 'AP 39 SV 7789',
      type: 'SUV',
      capacity: 6
    }
  ];

  for (const d of driverUsers) {
    const dUser = await prisma.user.upsert({
      where: { email: d.email },
      update: { password: hashedPassword },
      create: {
        name: d.name,
        email: d.email,
        password: hashedPassword,
        phone: d.phone,
        role: 'DRIVER'
      }
    });

    const driver = await prisma.driver.upsert({
      where: { userId: dUser.id },
      update: { isOnline: true, currentLat: d.lat, currentLng: d.lng, rating: d.rating },
      create: {
        userId: dUser.id,
        licenseNumber: d.licenseNumber,
        isOnline: true,
        currentLat: d.lat,
        currentLng: d.lng,
        rating: d.rating,
        totalRides: 12,
        totalEarnings: 2480.0
      }
    });

    await prisma.vehicle.upsert({
      where: { driverId: driver.id },
      update: { plateNumber: d.plateNumber },
      create: {
        driverId: driver.id,
        make: d.make,
        model: d.model,
        year: 2023,
        color: d.color,
        plateNumber: d.plateNumber,
        type: d.type,
        capacity: d.capacity
      }
    });
  }

  // 5. Seed Initial Historical Completed Ride for Demo Passenger
  const defaultDriver = await prisma.driver.findFirst({ include: { vehicle: true } });
  if (defaultDriver) {
    await prisma.ride.create({
      data: {
        rideNumber: 'URM-10482',
        passengerId: passengerUser.id,
        driverId: defaultDriver.id,
        pickupLat: 16.5062,
        pickupLng: 80.6480,
        pickupAddress: 'Vijayawada Railway Station',
        destLat: 16.4419,
        destLng: 80.6226,
        destAddress: 'KL University Campus (KLU), Vaddeswaram',
        rideType: 'SEDAN',
        status: 'COMPLETED',
        distanceKm: 12.4,
        estimatedTimeMin: 28,
        baseFare: 60,
        perKmFare: 18,
        estimatedFare: 184,
        finalFare: 184,
        paymentMethod: 'CASH',
        paymentStatus: 'SUCCESS',
        requestedAt: new Date(Date.now() - 86400000), // 1 day ago
        completedAt: new Date(Date.now() - 86400000 + 1680000)
      }
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
