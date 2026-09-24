import { prisma } from '../config/db';

export type RideTypeString = 'BIKE' | 'AUTO' | 'SEDAN' | 'SUV';

export interface EstimateFareResult {
  vehicleType: RideTypeString;
  baseFare: number;
  perKmFare: number;
  estimatedFare: number;
  distanceKm: number;
  estimatedTimeMin: number;
  capacity: number;
  description: string;
}

export async function calculateFare(
  vehicleType: string,
  distanceKm: number,
  estimatedTimeMin: number
): Promise<{ baseFare: number; perKmFare: number; estimatedFare: number; capacity: number }> {
  // Fetch configurable pricing from DB or fallback
  const config = await prisma.fareConfig.findUnique({
    where: { vehicleType }
  });

  const baseFare = config ? config.baseFare : getDefaultBaseFare(vehicleType);
  const perKmFare = config ? config.perKmFare : getDefaultPerKmFare(vehicleType);
  const perMinFare = config ? config.perMinFare : 2.0;
  const minFare = config ? config.minFare : 30.0;
  const capacity = config ? config.capacity : getDefaultCapacity(vehicleType);

  const rawFare = baseFare + distanceKm * perKmFare + estimatedTimeMin * perMinFare;
  const estimatedFare = Math.max(Math.round(rawFare), minFare);

  return { baseFare, perKmFare, estimatedFare, capacity };
}

export async function getAllFareEstimates(
  distanceKm: number,
  estimatedTimeMin: number
): Promise<EstimateFareResult[]> {
  const configs = await prisma.fareConfig.findMany();
  const types: RideTypeString[] = ['BIKE', 'AUTO', 'SEDAN', 'SUV'];

  const results: EstimateFareResult[] = [];

  for (const type of types) {
    const config = configs.find(c => c.vehicleType === type);
    const baseFare = config ? config.baseFare : getDefaultBaseFare(type);
    const perKmFare = config ? config.perKmFare : getDefaultPerKmFare(type);
    const perMinFare = config ? config.perMinFare : 2.0;
    const minFare = config ? config.minFare : 30.0;
    const capacity = config ? config.capacity : getDefaultCapacity(type);
    const description = config ? config.description : getDefaultDescription(type);

    const rawFare = baseFare + distanceKm * perKmFare + estimatedTimeMin * perMinFare;
    const estimatedFare = Math.max(Math.round(rawFare), minFare);

    results.push({
      vehicleType: type,
      baseFare,
      perKmFare,
      estimatedFare,
      distanceKm: Math.round(distanceKm * 10) / 10,
      estimatedTimeMin,
      capacity,
      description
    });
  }

  return results;
}

function getDefaultBaseFare(type: string): number {
  switch (type) {
    case 'BIKE': return 30;
    case 'AUTO': return 40;
    case 'SEDAN': return 60;
    case 'SUV': return 80;
    default: return 50;
  }
}

function getDefaultPerKmFare(type: string): number {
  switch (type) {
    case 'BIKE': return 10;
    case 'AUTO': return 14;
    case 'SEDAN': return 18;
    case 'SUV': return 22;
    default: return 15;
  }
}

function getDefaultCapacity(type: string): number {
  switch (type) {
    case 'BIKE': return 1;
    case 'AUTO': return 3;
    case 'SEDAN': return 4;
    case 'SUV': return 6;
    default: return 4;
  }
}

function getDefaultDescription(type: string): string {
  switch (type) {
    case 'BIKE': return 'Fast & affordable 1-seater bike ride';
    case 'AUTO': return 'Iconic 3-wheeler for quick city trips';
    case 'SEDAN': return 'Comfortable 4-seater sedan with AC';
    case 'SUV': return 'Spacious 6-seater SUV for group travels';
    default: return 'Standard ride';
  }
}
