import connectDB from '@/lib/mongodb';
import ShareCard from '@/lib/models/ShareCard';
import { redirect } from 'next/navigation';

/**
 * Share link landing page.
 * When someone opens a shared link, redirect them to the case page.
 * This page handles SSR metadata for social previews.
 */
export async function generateMetadata({ params }) {
  try {
    await connectDB();
    const { shareUrl } = await params;
    const card = await ShareCard.findOne({ shareUrl }).lean();

    if (card?.cardData) {
      return {
        title: `Dilemmas: ${card.cardData.caseTitle}`,
        description: `${card.cardData.side} — ${card.cardData.agreePercent}% India agrees. Tera kya verdict hai?`,
        openGraph: {
          title: `Dilemmas: ${card.cardData.caseTitle}`,
          description: `Maine kaha ${card.cardData.side} — ${card.cardData.agreePercent}% India agrees!`,
        },
      };
    }
  } catch {}

  return { title: 'Dilemmas' };
}

export default async function ShareLandingPage({ params }) {
  try {
    await connectDB();
    const { shareUrl } = await params;

    // Track click
    await ShareCard.findOneAndUpdate({ shareUrl }, { $inc: { clicks: 1 } });

    const card = await ShareCard.findOne({ shareUrl }).lean();
    if (card?.cardData?.caseSlug) {
      redirect(`/case/${card.cardData.caseSlug}`);
    }
  } catch (err) {
    if (err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
  }

  redirect('/');
}
