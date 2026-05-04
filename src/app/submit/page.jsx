'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Send, 
  Type, 
  AlignLeft, 
  Tag,
  Heart,
  Users,
  GraduationCap,
  Briefcase,
  Wallet,
  Home,
  Globe,
  HandHeart,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import TopBar from '@/shared/components/TopBar';
import BottomNav from '@/shared/components/BottomNav';
import { api } from '@/shared/api/apiClient';
import { useAuth } from '@/modules/auth/AuthContext';
import RichTextEditor from '@/shared/components/RichTextEditor';

const CATEGORIES = [
  { slug: 'relationship', key: 'relationship', icon: Heart },
  { slug: 'family', key: 'family', icon: Users },
  { slug: 'friendship', key: 'friendship', icon: HandHeart },
  { slug: 'college', key: 'college', icon: GraduationCap },
  { slug: 'workplace', key: 'workplace', icon: Briefcase },
  { slug: 'money', key: 'money', icon: Wallet },
  { slug: 'roommate', key: 'roommate', icon: Home },
  { slug: 'politics', key: 'politics', icon: Globe },
  { slug: 'tv-shows', key: 'tv-shows', icon: Smartphone },
  { slug: 'desi', key: 'desi', icon: Globe },
  { slug: 'other', key: 'other', icon: Tag },
];

export default function SubmitCasePage() {
  const router = useRouter();
  const { isLoggedIn, copy } = useAuth();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleSubmit = async () => {
    if (!isLoggedIn) { setError(`${copy.auth.loginRequired} 🔐`); return; }
    setSubmitting(true);
    setError('');

    try {
      const data = await api.post('/api/cases', { title, context, category });
      setSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-dvh bg-[var(--bg-primary)]">
        <TopBar />
        <main className="max-w-lg mx-auto px-4 pt-12 pb-nav text-center space-y-6">
          <div className="animate-slide-up">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-green-500/10 text-green-500">
                <CheckCircle2 size={64} />
              </div>
            </div>
            <h2 className="text-xl font-extrabold">{copy.submission.success}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              {copy.share.shareYourCase}
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => router.push(`/case/${success.shareSlug}`)}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white
                  bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)]
                  active:scale-95 transition-all shadow-lg shadow-[var(--accent-pink)]/20"
              >
                {copy.buttons.viewCase} 👀
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full py-3.5 rounded-xl text-sm font-bold
                  bg-[var(--bg-elevated)] text-[var(--text-secondary)]
                  active:scale-95 transition-all"
              >
                {copy.buttons.goToFeed} 🔥
              </button>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[var(--bg-primary)]">
      <TopBar />
      <main className="max-w-lg mx-auto px-4 pt-6 pb-nav space-y-6">

        {/* Progress indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 h-1.5 rounded-full overflow-hidden bg-[var(--bg-elevated)]">
              <div
                className={`h-full rounded-full transition-all duration-500
                  ${s <= step ? 'bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)]' : ''}`}
                style={{ width: s <= step ? '100%' : '0%' }}
              />
            </div>
          ))}
        </div>

        {/* Step 1: Title */}
        {step === 1 && (
          <div className="glass-card p-5 space-y-4 animate-slide-up">
            <div className="flex items-center gap-2 text-[var(--accent-orange)]">
              <Type size={20} />
              <h2 className="text-lg font-extrabold">{copy.submission.step1Title}</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)]">{copy.submission.step1Hint}</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={copy.submission.placeholder}
              maxLength={150}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-4
                text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                focus:outline-none focus:border-[var(--accent-orange)] transition-colors"
            />
            <p className="text-right text-xs text-[var(--text-muted)]">{title.length}/150</p>
            {error && <p className="text-sm text-[var(--accent-orange)]">{error}</p>}
            <button
              onClick={() => { setError(''); title.trim().length >= 5 ? setStep(2) : setError(copy.submission.minChars); }}
              className="w-full py-4 rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-2
                bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)]
                active:scale-95 transition-all shadow-lg shadow-[var(--accent-pink)]/10"
            >
              {copy.buttons.next} <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Context — Rich Text Editor */}
        {step === 2 && (
          <div className="glass-card p-5 space-y-4 animate-slide-up">
            <div className="flex items-center gap-2 text-[var(--accent-purple)]">
              <AlignLeft size={20} />
              <h2 className="text-lg font-extrabold">{copy.submission.step2Title}</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)]">{copy.submission.step2Hint} — {copy.submission.step2RichHint}</p>
            <RichTextEditor
              content={context}
              onUpdate={(html, wc) => { setContext(html); setWordCount(wc); }}
              placeholder={copy.submission.contextPlaceholder}
              maxWords={500}
            />
            {error && <p className="text-sm text-[var(--accent-orange)]">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setError(''); setStep(1); }}
                className="flex-1 py-4 rounded-xl text-sm font-bold bg-[var(--bg-elevated)] text-[var(--text-secondary)] flex items-center justify-center gap-1 active:scale-95 transition-all">
                <ChevronLeft size={18} /> {copy.buttons.back}
              </button>
              <button
                onClick={() => { setError(''); wordCount >= 10 ? (wordCount <= 500 ? setStep(3) : setError(copy.submission.maxWords)) : setError(copy.submission.minWords); }}
                className="flex-[1.5] py-4 rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-2
                  bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-cyan)] active:scale-95 transition-all shadow-lg shadow-[var(--accent-purple)]/10">
                {copy.buttons.next} <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Category */}
        {step === 3 && (
          <div className="glass-card p-5 space-y-4 animate-slide-up">
            <div className="flex items-center gap-2 text-[var(--accent-cyan)]">
              <Tag size={20} />
              <h2 className="text-lg font-extrabold">{copy.submission.step3Title}</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)]">{copy.submission.step3Hint}</p>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((c) => {
                const Icon = c.icon;
                return (
                  <button
                    key={c.slug}
                    onClick={() => setCategory(c.slug)}
                    className={`p-3.5 rounded-xl text-xs font-semibold text-left transition-all duration-200 flex items-center gap-2
                      ${category === c.slug
                        ? 'border-2 border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]'
                        : 'border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--text-muted)]'}`}
                  >
                    <Icon size={14} />
                    {copy.categories[c.key]}
                  </button>
                );
              })}
            </div>

            {error && <p className="text-sm text-[var(--accent-orange)]">{error}</p>}

            <div className="flex gap-2">
              <button onClick={() => { setError(''); setStep(2); }}
                className="flex-1 py-4 rounded-xl text-sm font-bold bg-[var(--bg-elevated)] text-[var(--text-secondary)] flex items-center justify-center gap-1 active:scale-95 transition-all">
                <ChevronLeft size={18} /> Piche
              </button>
              <button
                onClick={() => category ? handleSubmit() : setError(copy.submission.pickCategory)}
                disabled={submitting}
                className="flex-[1.5] py-4 rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-2
                  bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)]
                  disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-[var(--accent-pink)]/20 shake-cta">
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Send size={18} /> {copy.buttons.submitCase}</>
                )}
              </button>
            </div>
          </div>
        )}

      </main>
      <BottomNav />
    </div>
  );
}
