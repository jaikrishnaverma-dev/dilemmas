/**
 * Centralized Hinglish UI copy.
 * All user-facing text lives here — never hardcode strings in components.
 */

export const COPY = {
  // Voting sides — universal labels (works for person, company, govt etc.)
  sides: {
    teri_galti: 'Your Fault',
    uski_galti: 'Not Your Fault',
    situation_galat: 'Situation Hi Galat',
  },

  // Buttons
  buttons: {
    vote: 'Verdict Do ⚖️',
    submit: 'Case Daalo 📝',
    share: 'Share Karo 🔗',
    login: 'Login Karo',
    signup: 'Account Banao',
    logout: 'Logout',
    seeResults: 'Results Dekho 📊',
    loadMore: 'Aur Dikhao 👇',
    submitCase: 'Apna Case Daalo',
  },

  // Badge names
  badges: {
    none: 'Naya Judge',
    nyayadhish: 'Nyayadhish',
    street_smart: 'Street Smart',
    dil_se: 'Dil Se',
    devils_advocate: "Devil's Advocate",
  },

  // Feed
  feed: {
    trending: '🔥 Trending',
    latest: '🆕 Latest',
    expiringFomo: '⏰ Jaldi karo!',
    votes: 'votes',
    timeLeft: 'baaki hai',
    expired: 'Verdict sealed ✅',
    hotCase: '🔥 HOT',
    filterAll: 'Sab dekho',
    noResults: 'Abhi koi case nahi hai. Pehle case daalo!',
  },

  // Case submission
  submission: {
    step1Title: 'Kya hua? 🤔',
    step1Hint: 'Ek catchy title do — hook jaisa',
    step2Title: 'Poori baat batao 📖',
    step2Hint: 'Context do — dono sides fairly',
    step3Title: 'Category chuno 🏷️',
    step3Hint: 'Kis type ka scene hai?',
    success: 'Case submitted! Moderation ke baad live hoga 🎉',
  },

  // Verdict
  verdict: {
    pickSide: 'Apna side chuno 👇',
    reasonHint: 'Ek line mein batao — kyu?',
    reasonRequired: 'Reason dena zaroori hai bhai 🙏',
    alreadyVoted: 'Tu already vote kar chuka hai ✅',
    voteSuccess: 'Verdict registered! 🔥',
  },

  // Judge Score
  judgeScore: {
    yourScore: 'Tera Judge Score',
    totalVerdicts: 'Total Verdicts',
    fairRatings: 'Fair Ratings',
    nextBadge: 'aur verdicts for next badge',
    leaderboard: 'City Leaderboard 🏆',
  },

  // Share
  share: {
    cardTitle: 'Maine kaha:',
    agreesWith: 'India agrees',
    shareWhatsapp: 'WhatsApp pe bhejo',
    shareInsta: 'Insta Story pe daalo',
    copyLink: 'Link copy karo',
    copied: 'Link copied! 📋',
  },

  // City War Room
  warroom: {
    title: 'City War Room 🏙️',
    vsText: 'vs',
    citySays: 'ka verdict:',
  },

  // Auth
  auth: {
    loginTitle: 'Welcome back! 👋',
    signupTitle: 'Judge ban ja! ⚖️',
    username: 'Username',
    password: 'Password',
    email: 'Email (optional)',
    city: 'City',
    noAccount: 'Account nahi hai?',
    hasAccount: 'Pehle se account hai?',
  },

  // General
  general: {
    appName: 'Dilemmas',
    tagline: 'Your side deserves to be heard.',
    loading: 'Loading...',
    error: 'Kuch toh gadbad hai 😵',
    retry: 'Phir try karo',
  },
};

/** Get side label in Hinglish */
export function getSideLabel(side) {
  return COPY.sides[side] || side;
}

/** Get badge display name */
export function getBadgeLabel(badge) {
  return COPY.badges[badge] || COPY.badges.none;
}
