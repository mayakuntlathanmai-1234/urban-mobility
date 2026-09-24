import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  JWT_SECRET: process.env.JWT_SECRET || 'urban_ride_mobility_jwt_secret_key_2026_super_secure',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000'
};
