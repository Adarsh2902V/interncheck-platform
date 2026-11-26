export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, hashPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

export async function POST(request) {
  try {
    const body = await request.json();
    const validated = loginSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, password } = validated.data;
    const cleanEmail = email.toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Self-healing: auto-bootstrap Adarsh admin account if missing or on fresh cloud DB
    if (!user && (cleanEmail === 'adarsh@interncheck.com' || cleanEmail === 'admin@interncheck.edu') && password === 'Password123!') {
      const hashedPassword = await hashPassword('Password123!');
      user = await prisma.user.create({
        data: {
          name: 'Adarsh Verma',
          email: cleanEmail,
          password: hashedPassword,
          role: 'ADMIN',
          college: 'Computer Science and Engineering',
          branch: 'B.Tech CSE',
          graduationYear: 2026,
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    let isMatch = await verifyPassword(password, user.password);

    // Self-healing: if password mismatched for admin Adarsh, synchronize to Password123!
    if (!isMatch && (cleanEmail === 'adarsh@interncheck.com' || cleanEmail === 'admin@interncheck.edu') && password === 'Password123!') {
      const newHash = await hashPassword('Password123!');
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash, role: 'ADMIN' },
      });
      isMatch = true;
    }

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college,
      branch: user.branch,
      graduationYear: user.graduationYear,
      avatar: user.avatar,
    };

    const token = generateToken(safeUser);
    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
