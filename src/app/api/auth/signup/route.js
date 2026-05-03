import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { successResponse, errorResponse } from '@/lib/apiResponse';

/** POST /api/auth/signup */
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password, email, city, state, gender, ageBracket } = body;

    // Validate required fields
    if (!username || !password) {
      return errorResponse('Username aur password dono chahiye', 422, {
        username: !username ? 'Username required' : undefined,
        password: !password ? 'Password required' : undefined,
      });
    }

    if (username.length < 3 || username.length > 30) {
      return errorResponse('Username 3-30 characters hona chahiye', 422);
    }

    if (password.length < 6) {
      return errorResponse('Password kam se kam 6 characters', 422);
    }

    await connectDB();

    // Check if username exists
    const existing = await User.findOne({ username: username.toLowerCase().trim() });
    if (existing) {
      return errorResponse('Yeh username le liya gaya hai 😅', 409);
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.toLowerCase().trim(),
      email: email?.toLowerCase().trim() || undefined,
      passwordHash,
      city: city?.trim() || '',
      state: state?.trim() || '',
      gender: gender || 'prefer_not_to_say',
      ageBracket: ageBracket || '18-24',
    });

    const token = signToken(user._id.toString());

    return successResponse({
      token,
      user: {
        id: user._id,
        username: user.username,
        city: user.city,
        gender: user.gender,
        ageBracket: user.ageBracket,
      },
    }, 'Account ban gaya! Welcome Judge ⚖️', 201);

  } catch (err) {
    if (err.code === 11000) {
      return errorResponse('Username ya email already taken', 409);
    }
    console.error('Signup error:', err);
    return errorResponse('Signup failed', 500);
  }
}
