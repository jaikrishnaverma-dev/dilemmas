import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { verifyToken, extractToken } from '@/lib/jwt';
import { successResponse, errorResponse } from '@/lib/apiResponse';

/** PATCH /api/auth/change-password */
export async function PATCH(request) {
  try {
    const token = extractToken(request);
    const decoded = verifyToken(token);

    if (!decoded) {
      return errorResponse('Bhai, login toh karlo pehle 🔒', 401);
    }

    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return errorResponse('Purana aur naya dono password chahiye bhai', 422);
    }

    if (newPassword.length < 6) {
      return errorResponse('Naya password kam se kam 6 characters ka hona chahiye', 422);
    }

    await connectDB();
    const user = await User.findById(decoded.userId);

    if (!user) {
      return errorResponse('User nahi mila 🕵️', 404);
    }

    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return errorResponse('Purana password galat hai ❌', 403);
    }

    // Hash and update new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    await user.save();

    return successResponse(null, 'Password change ho gaya! Sahi hai ✅');

  } catch (err) {
    console.error('Change password error:', err);
    return errorResponse('Password change nahi ho paaya', 500);
  }
}
