import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { withRateLimit } from '@/lib/middleware/withRateLimit';

/** POST /api/auth/login */
async function login(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return errorResponse('Username aur password dono daal', 422);
    }

    await connectDB();

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return errorResponse('Galat username ya password 🤔', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse('Galat username ya password 🤔', 401);
    }

    const token = signToken(user._id.toString());

    return successResponse({
      token,
      user: {
        id: user._id,
        username: user.username,
        city: user.city,
        state: user.state,
        gender: user.gender,
        ageBracket: user.ageBracket,
        avatarUrl: user.avatarUrl,
      },
    }, 'Welcome back! 👋');

  } catch (err) {
    console.error('Login error:', err);
    return errorResponse('Login failed', 500);
  }
}

export const POST = withRateLimit(login, 'login', 20, 3600, 'Bohot zyada login attempts! Ek ghante mein sirf 20 baar try kar sakte ho. Thodi der baad aao 🔐');
