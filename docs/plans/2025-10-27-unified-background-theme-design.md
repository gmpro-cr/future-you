# Unified Background Theme Design

**Date:** 2025-10-27  
**Status:** Approved  
**Author:** Claude Code

## Overview

Implement a unified black background theme with floating particles across all pages of the Esperit application. This design eliminates visual inconsistencies (purple-blue gradients, blurred circle effects) and creates a cohesive, elegant aesthetic throughout the entire user experience.

## Problem Statement

Currently, different pages have inconsistent backgrounds:
- **Homepage**: Black with floating particles ✓
- **Persona page**: Black with particles BUT includes distracting blurred circle effects ✗
- **Chat interface**: Purple-blue gradient (completely different aesthetic) ✗
- **Other pages**: Unknown consistency

This creates a disjointed user experience and undermines brand cohesion.

## Design Goals

1. **Visual Consistency**: Identical background treatment across all pages
2. **Readability**: Subtle particle effects that don't distract from content
3. **Reusability**: Single source of truth for background styling
4. **Flexibility**: Adjustable particle density for different page contexts

## Solution Architecture

### Component Structure

```
DarkLayout Component (Enhanced)
├── Animated gradient background (existing)
├── FloatingParticles (count: configurable)
└── Page content (children)
```

### DarkLayout Props

```typescript
interface DarkLayoutProps {
  children: ReactNode;
  particleCount?: number;  // NEW: Default 40
  showParticles?: boolean; // EXISTING: Default true
}
```

### Visual Specifications

**Background:**
- Base: `bg-black`
- Gradient overlay: `bg-gradient-to-br from-black via-zinc-900 to-black`
- Animated wave: `from-white/5 via-transparent to-white/5` (20s loop)

**Particles:**
- Dense pages (homepage, personas): 40 particles
- Content-heavy pages (chat): 20 particles
- Size: 2-5px, opacity: 0.3-0.7
- Animation: Floating with 4-7s duration

**Removed Effects:**
- Blurred circle gradients (`blur-3xl rounded-full`)
- Page-specific gradient overrides

## Implementation Plan

### Phase 1: Enhance DarkLayout Component

**File:** `src/components/layouts/DarkLayout.tsx`

**Changes:**
1. Add `particleCount` prop with default value of 40
2. Pass `particleCount` to `<FloatingParticles count={particleCount} />`
3. Ensure fixed positioning for full-page background coverage

**No changes needed to:**
- Animated gradient background (already correct)
- Basic structure (already correct)

### Phase 2: Update Chat Interface

**File:** `src/components/chat/ChatInterface.tsx`

**Changes:**
1. Import DarkLayout component
2. Wrap entire component return with `<DarkLayout particleCount={20}>`
3. Remove `bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900` from root div
4. Change root div to use `flex flex-col h-screen` only
5. Ensure header/input backdrop-blur effects remain intact

**Preserved:**
- All chat functionality
- Message rendering
- Input area
- Modal behavior
- Loading states

### Phase 3: Clean Up Persona Page

**File:** `src/app/personas/page.tsx`

**Changes:**
1. Remove 3 instances of blurred circle `<motion.div>` elements:
   - Form view blurred circle
   - Edit view blurred circle
   - Main view blurred circle
2. Keep all DarkLayout usage (already correct)

**Pattern to remove:**
```tsx
<motion.div
  className="absolute inset-0 flex items-center justify-center opacity-10"
  initial={{ opacity: 0 }}
  animate={{ opacity: 0.1 }}
  transition={{ duration: 2 }}
>
  <div className="w-64 h-96 bg-gradient-to-b from-white to-gray-500 blur-3xl rounded-full" />
</motion.div>
```

### Phase 4: Audit Other Pages

**Files to check:**
- `src/app/about/page.tsx`
- `src/app/settings/page.tsx`
- `src/app/profile/page.tsx`
- `src/app/onboarding/page.tsx`

**Action:**
- If page lacks DarkLayout: Wrap with `<DarkLayout>`
- If page has custom background: Replace with DarkLayout
- Use appropriate particle count based on content density

## Testing Checklist

- [ ] Homepage: Verify background unchanged, particles work
- [ ] Persona page: Verify blurred circles removed, background consistent
- [ ] Chat interface: Verify purple-blue gradient gone, particles visible (subtle)
- [ ] Form views: Verify backgrounds consistent across create/edit modes
- [ ] Other pages: Verify all pages use unified theme
- [ ] Responsive: Test on mobile, tablet, desktop
- [ ] Animation: Verify gradient waves and particles animate smoothly
- [ ] Performance: Verify no lag from particle animations

## Success Criteria

1. All pages use identical background treatment (black + gradient + particles)
2. No visual inconsistencies across navigation
3. Chat interface readable with subtle particles (not distracting)
4. No blurred circle effects anywhere
5. Code is DRY (single source of truth: DarkLayout)

## Rollback Plan

If issues arise:
1. Revert ChatInterface to purple-blue gradient
2. Restore persona page blurred circles
3. Git commit rollback to previous state

## Future Considerations

- Theme switcher (light/dark modes)
- User preference for particle density
- Additional particle effects (colors, patterns)
- Performance optimization for low-end devices
