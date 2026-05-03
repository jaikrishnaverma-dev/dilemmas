import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { withAuth } from '@/lib/middleware/withAuth';
import { successResponse, errorResponse } from '@/lib/apiResponse';

/** GET /api/auth/me — Get current user profile */
async function getHandler(request) {
  const user = request.user;
  return successResponse({
    id: user._id,
    username: user.username,
    email: user.email,
    city: user.city,
    state: user.state,
    gender: user.gender,
    ageBracket: user.ageBracket,
    avatarUrl: user.avatarUrl,
    languagePreference: user.languagePreference || 'hinglish',
  }, 'Profile loaded');
}

/** PATCH /api/auth/me — Update user profile */
async function patchHandler(request) {
  try {
    const body = await request.json();
    const { languagePreference, city, state, gender, ageBracket } = body;

    await connectDB();
    
    const updates = {};
    if (languagePreference) updates.languagePreference = languagePreference;
    if (city !== undefined) updates.city = city;
    if (state !== undefined) updates.state = state;
    if (gender !== undefined) updates.gender = gender;
    if (ageBracket !== undefined) updates.ageBracket = ageBracket;

    const updatedUser = await User.findByIdAndUpdate(
      request.user._id,
      { $set: updates },
      { new: true }
    ).lean();

    return successResponse({
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      city: updatedUser.city,
      state: updatedUser.state,
      gender: updatedUser.gender,
      ageBracket: updatedUser.ageBracket,
      avatarUrl: updatedUser.avatarUrl,
      languagePreference: updatedUser.languagePreference,
    }, 'Profile updated! ✨');
  } catch (err) {
    console.error('Update profile error:', err);
    return errorResponse('Profile update nahi hua', 500);
  }
}

export const GET = withAuth(getHandler);
export const PATCH = withAuth(patchHandler);
