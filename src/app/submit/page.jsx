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
import { useAuth } from '@/modules/auth/AuthContext';
import { api } from '@/shared/api/apiClient';
import { COPY } from '@/shared/utils/hinglishCopy';
import RichTextEditor from '@/shared/components/RichTextEditor';

const CATEGORIES = [
  { slug: 'relationship', label: 'Relationship Drama', icon: Heart },
  { slug: 'family', label: 'Family Pressure', icon: Users },
  { slug: 'friendship', label: 'Friendship Conflict', icon: HandHeart },
  { slug: 'college', label: 'College Life', icon: GraduationCap },
  { slug: 'workplace', label: 'Workplace Drama', icon: Briefcase },
  { slug: 'money', label: 'Money Matters', icon: Wallet },
  { slug: 'roommate', label: 'Roommate Issues', icon: Home },
  { slug: 'politics', label: 'Politics', icon: Globe },
  { slug: 'tv-shows', label: 'TV Shows & Movies', icon: Smartphone },
  { slug: 'social-media', label: 'Social Media', icon: MessageSquare },
  { slug: 'desi', label: 'Desi Problems', icon: Globe },
  { slug: 'other', label: 'Other', icon: Tag },
];

export default function SubmitCasePage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleSubmit = async () => {
    if (!isLoggedIn) { setError('Pehle login karo case daalne ke liye! 🔐'); return; }
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
            <h2 className="text-xl font-extrabold">{COPY.submission.success}</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              Share karo apna case aur logo ko batao!
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => router.push(`/case/${success.shareSlug}`)}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white
                  bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)]
                  active:scale-95 transition-all shadow-lg shadow-[var(--accent-pink)]/20"
              >
                Apna Case Dekho 👀
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full py-3.5 rounded-xl text-sm font-bold
                  bg-[var(--bg-elevated)] text-[var(--text-secondary)]
                  active:scale-95 transition-all"
              >
                Feed pe jao 🔥
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
              <h2 className="text-lg font-extrabold">{COPY.submission.step1Title}</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)]">{COPY.submission.step1Hint}</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Best friend ne meri crush ko propose kar diya"
              maxLength={150}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-4
                text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                focus:outline-none focus:border-[var(--accent-orange)] transition-colors"
            />
            <p className="text-right text-xs text-[var(--text-muted)]">{title.length}/150</p>
            {error && <p className="text-sm text-[var(--accent-orange)]">{error}</p>}
            <button
              onClick={() => { setError(''); title.trim().length >= 5 ? setStep(2) : setError('Kam se kam 5 characters daalo'); }}
              className="w-full py-4 rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-2
                bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)]
                active:scale-95 transition-all shadow-lg shadow-[var(--accent-pink)]/10"
            >
              Aage badho <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Context — Rich Text Editor */}
        {step === 2 && (
          <div className="glass-card p-5 space-y-4 animate-slide-up">
            <div className="flex items-center gap-2 text-[var(--accent-purple)]">
              <AlignLeft size={20} />
              <h2 className="text-lg font-extrabold">{COPY.submission.step2Title}</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)]">{COPY.submission.step2Hint} — Use bold, italic, lists to tell your story</p>
            <RichTextEditor
              content={context}
              onUpdate={(html, wc) => { setContext(html); setWordCount(wc); }}
              placeholder="Poori baat batao... dono sides fairly. Bold karo important parts."
              maxWords={500}
            />
            {error && <p className="text-sm text-[var(--accent-orange)]">{error}</p>}
            <div className="flex gap-2">
              <button onClick={() => { setError(''); setStep(1); }}
                className="flex-1 py-4 rounded-xl text-sm font-bold bg-[var(--bg-elevated)] text-[var(--text-secondary)] flex items-center justify-center gap-1 active:scale-95 transition-all">
                <ChevronLeft size={18} /> Piche
              </button>
              <button
                onClick={() => { setError(''); wordCount >= 10 ? (wordCount <= 500 ? setStep(3) : setError('Max 500 words allowed!')) : setError('Kam se kam 10 words likho'); }}
                className="flex-[1.5] py-4 rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-2
                  bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-cyan)] active:scale-95 transition-all shadow-lg shadow-[var(--accent-purple)]/10">
                Aage badho <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Category */}
        {step === 3 && (
          <div className="glass-card p-5 space-y-4 animate-slide-up">
            <div className="flex items-center gap-2 text-[var(--accent-cyan)]">
              <Tag size={20} />
              <h2 className="text-lg font-extrabold">{COPY.submission.step3Title}</h2>
            </div>
            <p className="text-xs text-[var(--text-muted)]">{COPY.submission.step3Hint}</p>
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
                    {c.label}
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
                onClick={() => category ? handleSubmit() : setError('Category chuno!')}
                disabled={submitting}
                className="flex-[1.5] py-4 rounded-xl text-sm font-extrabold text-white flex items-center justify-center gap-2
                  bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-pink)]
                  disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-[var(--accent-pink)]/20 shake-cta">
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><Send size={18} /> {COPY.buttons.submitCase}</>
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
