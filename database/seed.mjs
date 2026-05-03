/**
 * Database seed script — run with: node database/seed.mjs
 * Populates categories, demo users, cases, verdicts, and judge scores.
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb://localhost:27017/apna_verdict';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('🔌 Connected to MongoDB');

  const db = mongoose.connection.db;

  // Clear existing data
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    await db.dropCollection(col.name);
  }
  console.log('🧹 Cleared database');

  // -- Categories --
  const CaseCategorySchema = new mongoose.Schema({
    name: String, slug: { type: String, unique: true }, emoji: String, displayOrder: Number,
  });
  const CaseCategory = mongoose.model('CaseCategory', CaseCategorySchema);

  const categories = await CaseCategory.insertMany([
    { name: 'Relationship Drama', slug: 'relationship', emoji: '💔', displayOrder: 1 },
    { name: 'Family Pressure', slug: 'family', emoji: '👨‍👩‍👧‍👦', displayOrder: 2 },
    { name: 'Friendship Conflict', slug: 'friendship', emoji: '🤝', displayOrder: 3 },
    { name: 'College Life', slug: 'college', emoji: '🎓', displayOrder: 4 },
    { name: 'Workplace Drama', slug: 'workplace', emoji: '💼', displayOrder: 5 },
    { name: 'Money Matters', slug: 'money', emoji: '💰', displayOrder: 6 },
    { name: 'Roommate Issues', slug: 'roommate', emoji: '🏠', displayOrder: 7 },
    { name: 'Social Media', slug: 'social-media', emoji: '📱', displayOrder: 8 },
    { name: 'Desi Problems', slug: 'desi', emoji: '🇮🇳', displayOrder: 9 },
    { name: 'Other', slug: 'other', emoji: '🤔', displayOrder: 10 },
  ]);
  console.log(`✅ ${categories.length} categories seeded`);

  // -- Users --
  const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true }, email: { type: String, unique: true, sparse: true },
    passwordHash: String, city: String, state: String, gender: String, ageBracket: String, avatarUrl: String,
  }, { timestamps: true });
  const User = mongoose.model('User', UserSchema);

  const hash = await bcrypt.hash('password123', 10);
  const users = await User.insertMany([
    { username: 'verdict_king', email: 'demo1@test.com', passwordHash: hash, city: 'Delhi', state: 'Delhi', gender: 'male', ageBracket: '18-24' },
    { username: 'nyaay_queen', email: 'demo2@test.com', passwordHash: hash, city: 'Mumbai', state: 'Maharashtra', gender: 'female', ageBracket: '18-24' },
    { username: 'sach_ka_judge', email: 'demo3@test.com', passwordHash: hash, city: 'Lucknow', state: 'Uttar Pradesh', gender: 'male', ageBracket: '25-34' },
    { username: 'dil_se_bolo', email: 'demo4@test.com', passwordHash: hash, city: 'Bangalore', state: 'Karnataka', gender: 'female', ageBracket: '18-24' },
    { username: 'faisla_kar', email: 'demo5@test.com', passwordHash: hash, city: 'Jaipur', state: 'Rajasthan', gender: 'other', ageBracket: '25-34' },
  ]);
  console.log(`✅ ${users.length} users seeded (password: password123)`);

  // -- Cases --
  const CaseSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId, title: String, context: String, category: String,
    status: String, city: String, ageBracket: String, expiresAt: Date, shareSlug: { type: String, unique: true },
    voteCount: Number,
  }, { timestamps: true });
  const Case = mongoose.model('Case', CaseSchema);

  const cases = await Case.insertMany([
    {
      userId: users[0]._id, title: 'Best friend ne meri crush ko propose kar diya',
      context: 'Mera best friend tha, 5 saal se. Usse pata tha ki mujhe kaun pasand hai. Phir bhi usne propose kar diya usko, bina bataye. Ab woh dono together hain aur mujhe bol raha hai "bhai pyaar mein sab fair hai." Kya sach mein fair hai?',
      category: 'friendship', status: 'live', city: 'Delhi', ageBracket: '18-24',
      expiresAt: new Date(Date.now() + 36 * 3600000), shareSlug: 'xK9mQ2pL', voteCount: 247,
    },
    {
      userId: users[1]._id, title: 'Parents ne arrange marriage fix kar di bina puche',
      context: 'I am 23F working in Bangalore. Ghar gai thi Diwali pe, parents ne ladka dikha diya aur bol diya ki engagement January mein hogi. Maine bola I am not ready, toh papa ne bola "tumhari umar nikal rahi hai." Mummy ro rahi thi. Kya mein galat hoon resist karne mein?',
      category: 'family', status: 'live', city: 'Mumbai', ageBracket: '18-24',
      expiresAt: new Date(Date.now() + 24 * 3600000), shareSlug: 'aB3nR7wX', voteCount: 534,
    },
    {
      userId: users[2]._id, title: 'Roommate mera khana kha jaata hai daily',
      context: 'Hostel mein rehta hoon. Roommate roz mera Maggi, biscuits, aur chips kha jaata hai. Jab bola toh kehta hai "yaar sharing caring." Ek din maine uska cake khaya toh usne full drama kar diya. Kaun galat hai?',
      category: 'roommate', status: 'live', city: 'Lucknow', ageBracket: '18-24',
      expiresAt: new Date(Date.now() + 40 * 3600000), shareSlug: 'cD5eF8gH', voteCount: 189,
    },
    {
      userId: users[3]._id, title: 'Manager ne mera idea chura liya presentation mein',
      context: 'Intern hoon ek startup mein. Maine ek idea diya team meeting mein — manager ne ignore kiya. Next week client presentation mein wahi idea uska bana ke present kiya. Credit zero. HR ko boloon ya chup rahoon?',
      category: 'workplace', status: 'live', city: 'Bangalore', ageBracket: '18-24',
      expiresAt: new Date(Date.now() + 18 * 3600000), shareSlug: 'iJ1kL4mN', voteCount: 412,
    },
    {
      userId: users[4]._id, title: 'GF ne bola choose — friends ya main',
      context: 'GF of 2 years ne ultimatum de diya — "tere friends ya main." Mere friends ek trip plan kar rahe the boys only. Maine bola main jaaunga, toh usne seen kar diya. Ab 3 din se baat nahi kar rahi. Kiski galti?',
      category: 'relationship', status: 'live', city: 'Jaipur', ageBracket: '25-34',
      expiresAt: new Date(Date.now() + 30 * 3600000), shareSlug: 'oP2qR6sT', voteCount: 678,
    },
    {
      userId: users[0]._id, title: 'Cousin ne shaadi mein insult kar diya stage pe',
      context: 'Cousin ki shaadi thi. Stage pe photo session mein usne bola "tum side mein khade ho jao, family photo hai." Mummy ne suna, bahut hurt hui. Kya mujhe usse confrontation karna chahiye ya jaane doon?',
      category: 'family', status: 'live', city: 'Delhi', ageBracket: '18-24',
      expiresAt: new Date(Date.now() + 42 * 3600000), shareSlug: 'uV3wX9yZ', voteCount: 156,
    },
  ]);
  console.log(`✅ ${cases.length} cases seeded`);

  // -- Verdicts --
  const VerdictSchema = new mongoose.Schema({
    caseId: mongoose.Schema.Types.ObjectId, userId: mongoose.Schema.Types.ObjectId,
    side: String, reason: String, city: String, gender: String,
  }, { timestamps: true });
  const Verdict = mongoose.model('Verdict', VerdictSchema);

  const verdicts = await Verdict.insertMany([
    { caseId: cases[0]._id, userId: users[1]._id, side: 'uski_galti', reason: 'Bro code toot gaya, simple. Dosti mein trust hoti hai.', city: 'Mumbai', gender: 'female' },
    { caseId: cases[0]._id, userId: users[2]._id, side: 'uski_galti', reason: 'Best friend ka matlab hota hai boundaries respect karna.', city: 'Lucknow', gender: 'male' },
    { caseId: cases[0]._id, userId: users[3]._id, side: 'situation_galat', reason: 'Crush toh kisi ki property nahi hai bhai. But batana chahiye tha.', city: 'Bangalore', gender: 'female' },
    { caseId: cases[0]._id, userId: users[4]._id, side: 'teri_galti', reason: 'Agar propose nahi kiya toh koi aur karega. Be faster.', city: 'Jaipur', gender: 'other' },
    { caseId: cases[1]._id, userId: users[0]._id, side: 'situation_galat', reason: 'Parents ka pressure hai but forcing is wrong in 2026.', city: 'Delhi', gender: 'male' },
    { caseId: cases[1]._id, userId: users[2]._id, side: 'uski_galti', reason: 'Your life your choice. No one should force marriage.', city: 'Lucknow', gender: 'male' },
    { caseId: cases[1]._id, userId: users[4]._id, side: 'uski_galti', reason: 'Parents galat hain. Bina puche engagement fix karna wrong.', city: 'Jaipur', gender: 'other' },
    { caseId: cases[2]._id, userId: users[0]._id, side: 'uski_galti', reason: 'Sharing caring sirf ek taraf se nahi hota. Hypocrite hai roommate.', city: 'Delhi', gender: 'male' },
    { caseId: cases[2]._id, userId: users[1]._id, side: 'uski_galti', reason: 'Double standards. Iska khana khaao toh problem, tumhara toh sharing.', city: 'Mumbai', gender: 'female' },
    { caseId: cases[4]._id, userId: users[0]._id, side: 'uski_galti', reason: 'Ultimatum dena toxic hai. Healthy relationship mein space hota hai.', city: 'Delhi', gender: 'male' },
    { caseId: cases[4]._id, userId: users[1]._id, side: 'teri_galti', reason: 'Bhai balance karo. GF ko bhi time do, friends ko bhi.', city: 'Mumbai', gender: 'female' },
    { caseId: cases[4]._id, userId: users[2]._id, side: 'uski_galti', reason: 'Seen karke ignore karna childish hai. Baat karo adult ki tarah.', city: 'Lucknow', gender: 'male' },
    { caseId: cases[4]._id, userId: users[3]._id, side: 'situation_galat', reason: 'Dono galat hain. Communication zero hai dono side se.', city: 'Bangalore', gender: 'female' },
  ]);
  console.log(`✅ ${verdicts.length} verdicts seeded`);

  // -- Judge Scores --
  const JudgeScoreSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, unique: true },
    totalVerdicts: Number, fairRatings: Number, score: Number, currentBadge: String, city: String,
  }, { timestamps: true });
  const JudgeScore = mongoose.model('JudgeScore', JudgeScoreSchema);

  await JudgeScore.insertMany([
    { userId: users[0]._id, totalVerdicts: 45, fairRatings: 32, score: 71.11, currentBadge: 'street_smart', city: 'Delhi' },
    { userId: users[1]._id, totalVerdicts: 38, fairRatings: 30, score: 78.95, currentBadge: 'nyayadhish', city: 'Mumbai' },
    { userId: users[2]._id, totalVerdicts: 52, fairRatings: 28, score: 53.85, currentBadge: 'dil_se', city: 'Lucknow' },
    { userId: users[3]._id, totalVerdicts: 15, fairRatings: 8, score: 53.33, currentBadge: 'none', city: 'Bangalore' },
    { userId: users[4]._id, totalVerdicts: 27, fairRatings: 20, score: 74.07, currentBadge: 'devils_advocate', city: 'Jaipur' },
  ]);
  console.log('✅ Judge scores seeded');

  console.log('\n🎉 Database seeded successfully!');
  console.log('Demo login: any user above with password "password123"');
  console.log('Example: username=verdict_king password=password123');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
