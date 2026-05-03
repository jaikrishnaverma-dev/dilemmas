import connectDB from '@/lib/mongodb';
import Notification from '@/lib/models/Notification';
import { withAuth } from '@/lib/middleware/withAuth';
import { successResponse, errorResponse } from '@/lib/apiResponse';

/** GET /api/notifications — Get user notifications */
async function getNotifications(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page  = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(30, parseInt(searchParams.get('limit') || '20'));

    const query = { userId: request.user._id };
    const unreadOnly = searchParams.get('unread') === 'true';
    if (unreadOnly) query.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId: request.user._id, read: false }),
    ]);

    return successResponse({
      notifications,
      unreadCount,
      pagination: { page, limit, total, hasMore: page * limit < total },
    }, 'Notifications loaded');
  } catch (err) {
    console.error('Notifications error:', err);
    return errorResponse('Notifications load nahi hue', 500);
  }
}

/** PATCH /api/notifications — Mark notifications as read */
async function markRead(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { notificationIds, markAll } = body;

    if (markAll) {
      await Notification.updateMany({ userId: request.user._id, read: false }, { read: true });
    } else if (notificationIds?.length) {
      await Notification.updateMany(
        { _id: { $in: notificationIds }, userId: request.user._id },
        { read: true }
      );
    }

    const unreadCount = await Notification.countDocuments({ userId: request.user._id, read: false });
    return successResponse({ unreadCount }, 'Marked as read');
  } catch (err) {
    console.error('Mark read error:', err);
    return errorResponse('Failed', 500);
  }
}

export const GET = withAuth(getNotifications);
export const PATCH = withAuth(markRead);
