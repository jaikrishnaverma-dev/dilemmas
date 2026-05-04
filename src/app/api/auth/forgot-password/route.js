import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { withRateLimit } from '@/lib/middleware/withRateLimit';

/** POST /api/auth/forgot-password */
async function forgotPassword(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return errorResponse('Email address is required', 422);
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // Don't reveal if user exists or not for security
      return successResponse(null, 'Agar yeh email registered hai, toh humne reset link bhej diya hai! Check your inbox 📧');
    }

    // Generate a simple token (in production use crypto.randomBytes)
    const token = Math.random().toString(36).slice(-10) + Date.now().toString(36);
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // MOCK: Here we would send email.
    console.log(`Password reset requested for: ${email}`);
    console.log(`Reset Token: ${token}`);
    console.log(`Reset Link: http://localhost:3000/reset-password?token=${token}`);

    return successResponse(null, 'Password reset link aapke email pe bhej diya gaya hai! 📧');

  } catch (err) {
    console.error('Forgot password error:', err);
    return errorResponse('Something went wrong', 500);
  }
}

export const POST = withRateLimit(forgotPassword, 'forgot_password', 6, 3600, 'Password reset ke liye ek ghante mein sirf 6 baar request kar sakte ho. Apna email inbox check karo! 📧');
