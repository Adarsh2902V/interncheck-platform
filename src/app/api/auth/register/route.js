import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';

export async function POST(request) {
  try {
    const body = await request.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { success: false, errors: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, role, college, branch, graduationYear } = validated.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'STUDENT',
        college: college || null,
        branch: branch || null,
        graduationYear: graduationYear || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        college: true,
        branch: true,
        graduationYear: true,
        createdAt: true,
      },
    });

    const token = generateToken(user);
    await setAuthCookie(token);

    return NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully',
        user,
        token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
