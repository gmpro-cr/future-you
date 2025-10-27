# Unified Background Theme Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a consistent black background with floating particles across all pages of the Esperit application, eliminating visual inconsistencies.

**Architecture:** Enhance the existing DarkLayout component to support configurable particle density, then systematically apply it to all pages while removing custom gradient backgrounds and blurred circle effects.

**Tech Stack:** React, TypeScript, Framer Motion, Tailwind CSS, Next.js 14

---

## Task 1: Enhance DarkLayout Component

**Files:**
- Modify: `src/components/layouts/DarkLayout.tsx`

**Step 1: Add particleCount prop to DarkLayout interface**

Update the interface to support configurable particle count:

```typescript
interface DarkLayoutProps {
  children: ReactNode;
  particleCount?: number;  // Add this line
  showParticles?: boolean;
}
```

**Step 2: Pass particleCount to FloatingParticles component**

Update the component to pass the prop:

```typescript
export function DarkLayout({ children, particleCount = 40, showParticles = true }: DarkLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Animated Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-zinc-900 to-black">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{ backgroundSize: "200% 200%" }}
        />
      </div>

      {/* Floating Particles */}
      {showParticles && <FloatingParticles count={particleCount} />}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
```

**Step 3: Verify changes don't break existing usage**

Check that the change is backward compatible (default values maintain current behavior).

**Step 4: Commit**

```bash
cd ~/.config/superpowers/worktrees/Esperit/unified-background-theme
git add src/components/layouts/DarkLayout.tsx
git commit -m "feat: add particleCount prop to DarkLayout for flexible particle density"
```

---

## Task 2: Update ChatInterface Component

**Files:**
- Modify: `src/components/chat/ChatInterface.tsx`

**Step 1: Import DarkLayout at the top of the file**

Add import after existing imports:

```typescript
import { DarkLayout } from '@/components/layouts/DarkLayout';
```

**Step 2: Wrap the entire return statement with DarkLayout**

Replace the current return statement. Change from:

```typescript
return (
  <>
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
```

To:

```typescript
return (
  <DarkLayout particleCount={20}>
    <div className="flex flex-col h-screen">
```

**Step 3: Close DarkLayout wrapper at the end**

Change the closing from:

```typescript
      </div>
      {/* Modals */}
      <ConfirmModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onConfirm={confirmNewChat}
        title="Start New Chat?"
        description="This will clear your current conversation. The conversation will be saved in your browser."
        confirmText="Start New Chat"
        isDestructive
      />
    </>
```

To:

```typescript
      </div>
    </DarkLayout>
    {/* Modals */}
    <ConfirmModal
      isOpen={showNewChatModal}
      onClose={() => setShowNewChatModal(false)}
      onConfirm={confirmNewChat}
      title="Start New Chat?"
      description="This will clear your current conversation. The conversation will be saved in your browser."
      confirmText="Start New Chat"
      isDestructive
    />
```

Note: Move ConfirmModal outside DarkLayout wrapper (stays in fragment).

**Step 4: Test the chat interface**

Run dev server and verify:
- Chat interface loads without errors
- Black background with subtle particles visible
- Messages readable
- No purple-blue gradient visible

```bash
npm run dev
```

Open http://localhost:3000/chat and verify visuals.

**Step 5: Commit**

```bash
git add src/components/chat/ChatInterface.tsx
git commit -m "feat: apply unified background theme to chat interface"
```

---

## Task 3: Remove Blurred Circle from Persona Page (Form View)

**Files:**
- Modify: `src/app/personas/page.tsx`

**Step 1: Remove blurred circle effect from form view**

Find this block (around line 180-190):

```typescript
      <FloatingParticles />
      <motion.div
        className="absolute inset-0 flex items-center justify-center opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2 }}
      >
        <div className="w-64 h-96 bg-gradient-to-b from-white to-gray-500 blur-3xl rounded-full" />
      </motion.div>
      <div className="relative z-10">
```

Remove the entire `<motion.div>` block (keep FloatingParticles and the content div):

```typescript
      <FloatingParticles />
      <div className="relative z-10">
```

**Step 2: Verify form view renders correctly**

Check that PersonaForm still displays properly without the blurred circle effect.

**Step 3: Commit**

```bash
git add src/app/personas/page.tsx
git commit -m "refactor: remove blurred circle effect from persona form view"
```

---

## Task 4: Remove Blurred Circle from Persona Page (Edit View)

**Files:**
- Modify: `src/app/personas/page.tsx`

**Step 1: Remove blurred circle effect from edit view**

Find the second instance of blurred circle (around line 220-230):

```typescript
      <FloatingParticles />
      <motion.div
        className="absolute inset-0 flex items-center justify-center opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2 }}
      >
        <div className="w-64 h-96 bg-gradient-to-b from-white to-gray-500 blur-3xl rounded-full" />
      </motion.div>
      <div className="relative z-10">
```

Remove the entire `<motion.div>` block:

```typescript
      <FloatingParticles />
      <div className="relative z-10">
```

**Step 2: Verify edit view renders correctly**

Check that PersonaForm in edit mode displays properly without the blurred circle effect.

**Step 3: Commit**

```bash
git add src/app/personas/page.tsx
git commit -m "refactor: remove blurred circle effect from persona edit view"
```

---

## Task 5: Remove Blurred Circle from Persona Page (Main View)

**Files:**
- Modify: `src/app/personas/page.tsx`

**Step 1: Remove blurred circle effect from main view**

Find the third instance of blurred circle (around line 260-270):

```typescript
      <FloatingParticles />
      <motion.div
        className="absolute inset-0 flex items-center justify-center opacity-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 2 }}
      >
        <div className="w-64 h-96 bg-gradient-to-b from-white to-gray-500 blur-3xl rounded-full" />
      </motion.div>

      {/* Left Profile Panel - Hidden on mobile, visible on large screens */}
```

Remove the entire `<motion.div>` block:

```typescript
      <FloatingParticles />

      {/* Left Profile Panel - Hidden on mobile, visible on large screens */}
```

**Step 2: Verify main persona view renders correctly**

Check that the main persona list page displays properly without the blurred circle effect.

**Step 3: Commit**

```bash
git add src/app/personas/page.tsx
git commit -m "refactor: remove blurred circle effect from persona main view"
```

---

## Task 6: Audit About Page

**Files:**
- Read: `src/app/about/page.tsx`

**Step 1: Check if About page exists and its current background**

```bash
cat src/app/about/page.tsx
```

**Step 2: If page has custom background, wrap with DarkLayout**

If the page doesn't use DarkLayout:

1. Import DarkLayout:
```typescript
import { DarkLayout } from '@/components/layouts/DarkLayout';
```

2. Wrap the return content:
```typescript
export default function AboutPage() {
  return (
    <DarkLayout>
      {/* existing content */}
    </DarkLayout>
  );
}
```

**Step 3: Test About page**

```bash
npm run dev
```

Open http://localhost:3000/about and verify unified background.

**Step 4: Commit (if changes made)**

```bash
git add src/app/about/page.tsx
git commit -m "feat: apply unified background theme to about page"
```

---

## Task 7: Audit Settings Page

**Files:**
- Read: `src/app/settings/page.tsx`

**Step 1: Check if Settings page exists and its current background**

```bash
cat src/app/settings/page.tsx
```

**Step 2: If page has custom background, wrap with DarkLayout**

If the page doesn't use DarkLayout:

1. Import DarkLayout:
```typescript
import { DarkLayout } from '@/components/layouts/DarkLayout';
```

2. Wrap the return content:
```typescript
export default function SettingsPage() {
  return (
    <DarkLayout>
      {/* existing content */}
    </DarkLayout>
  );
}
```

**Step 3: Test Settings page**

```bash
npm run dev
```

Open http://localhost:3000/settings and verify unified background.

**Step 4: Commit (if changes made)**

```bash
git add src/app/settings/page.tsx
git commit -m "feat: apply unified background theme to settings page"
```

---

## Task 8: Audit Profile Page

**Files:**
- Read: `src/app/profile/page.tsx`

**Step 1: Check if Profile page exists and its current background**

```bash
cat src/app/profile/page.tsx
```

**Step 2: If page has custom background, wrap with DarkLayout**

If the page doesn't use DarkLayout:

1. Import DarkLayout:
```typescript
import { DarkLayout } from '@/components/layouts/DarkLayout';
```

2. Wrap the return content:
```typescript
export default function ProfilePage() {
  return (
    <DarkLayout>
      {/* existing content */}
    </DarkLayout>
  );
}
```

**Step 3: Test Profile page**

```bash
npm run dev
```

Open http://localhost:3000/profile and verify unified background.

**Step 4: Commit (if changes made)**

```bash
git add src/app/profile/page.tsx
git commit -m "feat: apply unified background theme to profile page"
```

---

## Task 9: Audit Onboarding Page

**Files:**
- Read: `src/app/onboarding/page.tsx`

**Step 1: Check if Onboarding page exists and its current background**

```bash
cat src/app/onboarding/page.tsx
```

**Step 2: If page has custom background, wrap with DarkLayout**

If the page doesn't use DarkLayout:

1. Import DarkLayout:
```typescript
import { DarkLayout } from '@/components/layouts/DarkLayout';
```

2. Wrap the return content:
```typescript
export default function OnboardingPage() {
  return (
    <DarkLayout>
      {/* existing content */}
    </DarkLayout>
  );
}
```

**Step 3: Test Onboarding page**

```bash
npm run dev
```

Open http://localhost:3000/onboarding and verify unified background.

**Step 4: Commit (if changes made)**

```bash
git add src/app/onboarding/page.tsx
git commit -m "feat: apply unified background theme to onboarding page"
```

---

## Task 10: Final Testing and Verification

**Step 1: Run full application and test all pages**

```bash
npm run dev
```

Test navigation through all pages:
- Homepage: http://localhost:3000/ (verify unchanged)
- Personas: http://localhost:3000/personas (verify no blurred circles)
- Chat: http://localhost:3000/chat (verify black background, subtle particles)
- About: http://localhost:3000/about
- Settings: http://localhost:3000/settings
- Profile: http://localhost:3000/profile
- Onboarding: http://localhost:3000/onboarding

**Step 2: Verify visual consistency checklist**

- [ ] All pages have black background
- [ ] All pages have animated gradient waves
- [ ] All pages have floating particles (appropriate density)
- [ ] No purple-blue gradients anywhere
- [ ] No blurred circle effects anywhere
- [ ] Chat interface is readable with particles
- [ ] Particles don't obstruct content
- [ ] Backdrop blur effects still work on headers/modals

**Step 3: Run type check**

```bash
npm run type-check
```

Verify no NEW TypeScript errors (existing errors are okay).

**Step 4: Test responsive design**

Test on mobile viewport (DevTools):
- Verify backgrounds work on mobile
- Verify particles don't cause performance issues
- Verify content remains readable

**Step 5: Create summary commit (if needed)**

If any final tweaks were made:

```bash
git add -A
git commit -m "chore: final verification and cleanup for unified background theme"
```

---

## Completion Checklist

After all tasks:

- [ ] DarkLayout enhanced with particleCount prop
- [ ] ChatInterface uses DarkLayout with 20 particles
- [ ] Persona page has no blurred circles (3 instances removed)
- [ ] All other pages audited and updated if needed
- [ ] All pages have consistent background theme
- [ ] Manual testing completed successfully
- [ ] No new TypeScript errors introduced
- [ ] All changes committed with clear messages

---

## Next Steps

After implementation:

1. Push branch to remote
2. Create pull request
3. Request visual review from team
4. Deploy to staging for final verification
5. Merge to main after approval

## Rollback Plan

If issues arise:

```bash
git log --oneline  # Find commits before this work
git reset --hard <commit-hash>  # Rollback to before changes
```

Or cherry-pick revert individual commits:

```bash
git revert <commit-hash>
```
