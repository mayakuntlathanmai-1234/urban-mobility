import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { ENV } from '../config/env';
import { AuthRequest } from '../middleware/authMiddleware';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, role, licenseNumber, vehicleMake, vehicleModel, vehicleYear, vehicleColor, vehiclePlate, vehicleType } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'DRIVER' ? 'DRIVER' : role === 'ADMIN' ? 'ADMIN' : 'PASSENGER';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: userRole
      }
    });

    let driverId: string | undefined = undefined;

    // If Driver role, create Driver profile and Vehicle record
    if (userRole === 'DRIVER') {
      const driver = await prisma.driver.create({
        data: {
          userId: user.id,
          licenseNumber: licenseNumber || `DL-${Math.floor(100000 + Math.random() * 900000)}`,
          isOnline: true,
          currentLat: 16.5062,
          currentLng: 80.6480
        }
      });
      driverId = driver.id;

      await prisma.vehicle.create({
        data: {
          driverId: driver.id,
          make: vehicleMake || 'Hyundai',
          model: vehicleModel || 'i20',
          year: vehicleYear ? parseInt(vehicleYear) : 2023,
          color: vehicleColor || 'White',
          plateNumber: vehiclePlate || `AP ${Math.floor(10 + Math.random() * 89)} AB ${Math.floor(1000 + Math.random() * 9000)}`,
          type: vehicleType || 'SEDAN',
          capacity: vehicleType === 'BIKE' ? 1 : vehicleType === 'AUTO' ? 3 : vehicleType === 'SUV' ? 6 : 4
        }
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, driverId },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        driverId
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to register user', details: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        driver: {
          include: {
            vehicle: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const driverId = user.driver?.id;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, driverId },
      ENV.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        driverId,
        driver: user.driver
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        driver: {
          include: {
            vehicle: true
          }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        driverId: user.driver?.id,
        driver: user.driver
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

export const logout = async (req: Request, res: Response) => {
  return res.json({ message: 'Logged out successfully' });
};
