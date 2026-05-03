'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AtSign, MapPin } from 'lucide-react';
import { api } from '@/shared/api/apiClient';

/**
 * MentionInput — text input with @mention autocomplete.
 * Shows up to 3 matching usernames when user types @.
 * 
 * Props:
 *   value, onChange, placeholder, maxLength, rows, className
 *   multiline: boolean — if true, renders textarea; else input
 */
export default function MentionInput({
  value = '',
  onChange,
  placeholder = '',
  maxLength = 280,
  rows = 2,
  multiline = false,
  className = '',
}) {
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1); // index of '@' in value
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Detect @mention while typing
  const detectMention = useCallback((text, cursorPos) => {
    // Look backward from cursor to find an '@'
    const beforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = beforeCursor.lastIndexOf('@');

    if (lastAtIndex === -1) {
      setShowDropdown(false);
      return;
    }

    // Check that @ is at start or preceded by whitespace
    if (lastAtIndex > 0 && !/\s/.test(beforeCursor[lastAtIndex - 1])) {
      setShowDropdown(false);
      return;
    }

    const query = beforeCursor.substring(lastAtIndex + 1);

    // Query should be alphanumeric/underscore only, no spaces
    if (!/^[a-zA-Z0-9_]*$/.test(query)) {
      setShowDropdown(false);
      return;
    }

    // Need at least 1 char after @
    if (query.length < 1) {
      setShowDropdown(false);
      return;
    }

    setMentionQuery(query);
    setMentionStart(lastAtIndex);
    setSelectedIndex(0);

    // Debounced search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchUsers(query);
    }, 200);
  }, []);

  const searchUsers = async (query) => {
    setLoading(true);
    try {
      const data = await api.get(`/api/search?q=${encodeURIComponent(query)}&type=users&limit=3`);
      setSuggestions(data.users || []);
      setShowDropdown((data.users || []).length > 0);
    } catch {
      setSuggestions([]);
      setShowDropdown(false);
    }
    setLoading(false);
  };

  // Handle text change
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    const cursorPos = e.target.selectionStart;
    detectMention(newValue, cursorPos);
  };

  // Handle selecting a suggestion
  const selectUser = (username) => {
    if (mentionStart === -1) return;

    const before = value.substring(0, mentionStart);
    const afterCursor = value.substring(mentionStart + mentionQuery.length + 1); // +1 for @
    const newValue = `${before}@${username} ${afterCursor}`;

    onChange(newValue);
    setShowDropdown(false);
    setSuggestions([]);
    setMentionStart(-1);

    // Refocus and set cursor after the inserted mention
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = before.length + username.length + 2; // @ + username + space
        inputRef.current.focus();
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 10);
  };

  // Keyboard navigation in dropdown
  const handleKeyDown = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (showDropdown && suggestions[selectedIndex]) {
        e.preventDefault();
        selectUser(suggestions[selectedIndex].username);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const InputElement = multiline ? 'textarea' : 'input';

  return (
    <div className="relative">
      <InputElement
        ref={inputRef}
        type={multiline ? undefined : 'text'}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={multiline ? rows : undefined}
        className={`w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl px-4 py-3
          text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
          focus:outline-none focus:border-[var(--accent-purple)] transition-colors
          ${multiline ? 'resize-none' : ''} ${className}`}
      />

      {/* @mention autocomplete dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 bottom-full mb-1 z-50
            bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl
            shadow-xl shadow-black/30 overflow-hidden animate-slide-up"
        >
          {suggestions.map((user, i) => (
            <button
              key={user._id}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); selectUser(user.username); }}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors
                ${i === selectedIndex
                  ? 'bg-[var(--accent-purple)]/10'
                  : 'hover:bg-[var(--bg-elevated)]'}`}
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-card)]
                border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-black text-[var(--text-primary)]">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[var(--text-primary)] truncate">@{user.username}</p>
                {user.city && (
                  <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-0.5">
                    <MapPin size={8} /> {user.city}
                  </p>
                )}
              </div>
              <AtSign size={12} className="text-[var(--accent-purple)] shrink-0" />
            </button>
          ))}
          <div className="px-3 py-1.5 bg-[var(--bg-elevated)] border-t border-[var(--border-subtle)]">
            <p className="text-[9px] text-[var(--text-muted)] font-medium">↑↓ navigate · Enter/Tab select · Esc close</p>
          </div>
        </div>
      )}
    </div>
  );
}
