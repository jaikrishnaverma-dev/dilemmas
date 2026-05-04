import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { successResponse, errorResponse } from '@/lib/apiResponse';

/** POST /api/auth/reset-password */
export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return errorResponse('Token aur naya password dono chahiye bhai', 422);
    }

    if (password.length < 6) {
      return errorResponse('Password kam se kam 6 characters ka hona chahiye', 422);
    }

    await connectDB();

    // Find user with matching token and unexpired date
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return errorResponse('Reset link purana ho gaya hai ya galat hai. Phir se try karein ❌', 400);
    }

    // Hash and update password
    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;
    
    // Clear reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    return successResponse(null, 'Password update ho gaya! Ab aap login kar sakte hain ✅');

  } catch (err) {
    console.error('Reset password error:', err);
    return errorResponse('Something went wrong', 500);
  }
}
