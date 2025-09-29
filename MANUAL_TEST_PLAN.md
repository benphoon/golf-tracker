# Manual Test Plan: Enhanced Multiplayer Experience

## Overview
This test plan validates the new card-based multiplayer interface and ensures proper differentiation between single-player and multiplayer experiences.

## Test Environment Setup
- **Browsers**: Chrome, Firefox, Safari (iOS), Chrome (Android)
- **Devices**: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)
- **Clear browser cache and session storage before each test session**

---

## 1. User Flow Testing

### Test Case 1.1: Single Player Flow
**Objective**: Verify single player uses traditional detailed scorecard

**Steps**:
1. Navigate to application homepage
2. Click "Start Tracking"
3. Select "9 holes" or "18 holes"
4. On Player Setup, keep default 1 player
5. Verify text shows "Single player practice mode"
6. Click "Continue to Scoring"
7. Verify traditional ScoreCard interface loads (table view with leaderboard, hole navigation, score overview)

**Expected Results**:
- ✅ Player Setup shows "Single player practice mode"
- ✅ Detailed scorecard with comprehensive tables and leaderboard
- ✅ Traditional golf green color scheme
- ✅ All existing single-player functionality preserved

### Test Case 1.2: Multiplayer Flow (2 Players)
**Objective**: Verify 2-player experience uses card-based interface

**Steps**:
1. Navigate to application homepage
2. Click "Start Tracking"
3. Select "9 holes"
4. On Player Setup, click "Add Player" to have 2 players
5. Verify text shows "Multiplayer mode - 2 players"
6. Verify hint shows "🎯 Multiplayer mode uses a card-based interface"
7. Enter custom names for players
8. Click "Continue to Scoring"
9. Verify MultiplayerCardView loads with card-based interface

**Expected Results**:
- ✅ Player Setup shows "Multiplayer mode - 2 players"
- ✅ Card-based interface with blue/green color scheme
- ✅ Both players visible in single card view
- ✅ Large, touch-friendly score inputs
- ✅ Swipe navigation available

### Test Case 1.3: Multiplayer Flow (3-4 Players)
**Objective**: Verify grid layout adapts for more players

**Steps**:
1. Follow Test Case 1.2 but add 3-4 players
2. Verify grid layout changes appropriately
3. Test with maximum 4 players

**Expected Results**:
- ✅ 3 players: 2x2 grid with one empty space
- ✅ 4 players: 2x2 grid fully utilized
- ✅ Player names and inputs clearly visible
- ✅ No UI overflow or cramping

---

## 2. Interface Validation

### Test Case 2.1: Visual Design Validation
**Objective**: Verify distinct visual themes

**Steps**:
1. Compare single-player and multiplayer interfaces side by side
2. Check color schemes, layouts, and overall feel

**Expected Results**:
- ✅ Single-player: Green/amber theme, table-based layout
- ✅ Multiplayer: Blue/green gradient theme, card-based layout
- ✅ Clearly different visual experiences
- ✅ Both interfaces feel polished and cohesive

### Test Case 2.2: Card-Based Interface Elements
**Objective**: Verify all card interface elements work correctly

**Steps**:
1. Start multiplayer game (2+ players)
2. Verify hole header with gradient background
3. Check hole number, par display
4. Verify navigation arrows
5. Check progress indicator dots
6. Verify player score cards layout
7. Check leaderboard section

**Expected Results**:
- ✅ Hole header clearly displays current hole and par
- ✅ Navigation arrows have proper hover/disabled states
- ✅ Progress dots show current position accurately
- ✅ Player cards have proper spacing and styling
- ✅ Leaderboard updates in real-time

---

## 3. Navigation Testing

### Test Case 3.1: Button Navigation
**Objective**: Verify arrow button navigation works correctly

**Steps**:
1. Start multiplayer game
2. Navigate through holes using left/right arrow buttons
3. Test at hole boundaries (hole 1 and final hole)
4. Verify disabled states

**Expected Results**:
- ✅ Left arrow disabled on hole 1
- ✅ Right arrow disabled on final hole
- ✅ Smooth transitions between holes
- ✅ Current hole number updates correctly

### Test Case 3.2: Swipe Gesture Navigation (Mobile)
**Objective**: Verify touch/swipe navigation on mobile devices

**Steps**:
1. Test on actual mobile device or browser dev tools mobile mode
2. Swipe left to advance holes
3. Swipe right to go back
4. Test edge cases and short swipes

**Expected Results**:
- ✅ Swipe left advances to next hole
- ✅ Swipe right goes to previous hole
- ✅ Short swipes are ignored (< 50px)
- ✅ Swipes don't interfere with score input

### Test Case 3.3: Auto-Advance Feature
**Objective**: Verify auto-advance appears when all players complete hole

**Steps**:
1. Start multiplayer game with 2 players
2. Enter scores for both players on hole 1
3. Verify "Continue to Hole 2 →" button appears
4. Click button and verify navigation

**Expected Results**:
- ✅ Auto-advance button appears when all players have scores
- ✅ Button correctly advances to next hole
- ✅ Button doesn't appear on final hole

---

## 4. Score Input Testing

### Test Case 4.1: Score Input Validation
**Objective**: Verify score inputs work correctly for all players

**Steps**:
1. Start multiplayer game
2. Test entering scores for each player
3. Test invalid scores (0, negative, > 15)
4. Test clearing scores
5. Test rapid input

**Expected Results**:
- ✅ Valid scores (1-15) are accepted
- ✅ Invalid scores are rejected
- ✅ Score inputs are large and touch-friendly
- ✅ Visual feedback (checkmarks) for completed scores

### Test Case 4.2: Real-time Updates
**Objective**: Verify leaderboard and totals update immediately

**Steps**:
1. Enter scores for players
2. Observe leaderboard changes
3. Check total score calculations
4. Verify ranking changes

**Expected Results**:
- ✅ Leaderboard updates immediately when scores entered
- ✅ Total scores calculate correctly
- ✅ Rankings update based on total scores
- ✅ Trophy icons display correctly (🥇🥈🥉👤)

---

## 5. Mobile Responsiveness

### Test Case 5.1: Mobile Portrait (375x667)
**Objective**: Verify interface works on small mobile screens

**Steps**:
1. Test on iPhone SE size (375x667)
2. Verify all elements are accessible
3. Check touch target sizes
4. Test scrolling behavior

**Expected Results**:
- ✅ All elements fit within viewport
- ✅ Touch targets minimum 44px
- ✅ Text remains readable
- ✅ No horizontal scrolling required

### Test Case 5.2: Mobile Landscape
**Objective**: Verify interface adapts to landscape orientation

**Steps**:
1. Rotate device to landscape
2. Check layout adaptation
3. Verify usability

**Expected Results**:
- ✅ Layout adapts appropriately
- ✅ Interface remains functional
- ✅ No critical elements are hidden

### Test Case 5.3: Tablet (768x1024)
**Objective**: Verify interface works well on tablet sizes

**Steps**:
1. Test on iPad-sized device
2. Check spacing and layout
3. Verify touch interactions

**Expected Results**:
- ✅ Interface utilizes space efficiently
- ✅ Touch targets are appropriate
- ✅ Layout doesn't feel cramped or too spacious

---

## 6. Session Storage and Persistence

### Test Case 6.1: Game State Persistence
**Objective**: Verify game state saves and loads correctly

**Steps**:
1. Start multiplayer game
2. Enter some scores
3. Navigate to different hole
4. Refresh browser
5. Verify state restoration

**Expected Results**:
- ✅ Current hole position restored
- ✅ All player scores preserved
- ✅ Game continues from where left off

### Test Case 6.2: Storage Separation
**Objective**: Verify single and multiplayer games use separate storage

**Steps**:
1. Start single-player game, enter scores
2. Start multiplayer game, enter different scores
3. Switch between games
4. Verify no data interference

**Expected Results**:
- ✅ Single and multiplayer games maintain separate state
- ✅ No cross-contamination of data
- ✅ Each mode loads correct saved state

---

## 7. Accessibility Testing

### Test Case 7.1: Keyboard Navigation
**Objective**: Verify interface is keyboard accessible

**Steps**:
1. Navigate using only keyboard (Tab, Enter, Arrow keys)
2. Test score input focus
3. Verify all interactive elements are reachable

**Expected Results**:
- ✅ All interactive elements focusable via keyboard
- ✅ Focus indicators clearly visible
- ✅ Logical tab order
- ✅ Score inputs accept keyboard input

### Test Case 7.2: Screen Reader Compatibility
**Objective**: Verify ARIA labels and semantic structure

**Steps**:
1. Use screen reader (VoiceOver, NVDA, etc.)
2. Verify navigation button labels
3. Check score input labels
4. Test overall page structure

**Expected Results**:
- ✅ Navigation buttons have descriptive labels
- ✅ Score inputs clearly identify player and hole
- ✅ Page structure is logical for screen readers
- ✅ Important information is announced

---

## 8. Performance Testing

### Test Case 8.1: Large Rounds (18 holes, 4 players)
**Objective**: Verify performance with maximum data

**Steps**:
1. Start 18-hole game with 4 players
2. Enter scores for all holes
3. Navigate rapidly between holes
4. Check for lag or performance issues

**Expected Results**:
- ✅ No noticeable lag in navigation
- ✅ Score updates remain responsive
- ✅ Memory usage remains reasonable
- ✅ No visual glitches or stuttering

---

## 9. Edge Cases and Error Handling

### Test Case 9.1: Corrupted Session Storage
**Objective**: Verify graceful handling of corrupted data

**Steps**:
1. Manually corrupt session storage data
2. Reload application
3. Verify graceful fallback

**Expected Results**:
- ✅ Application doesn't crash
- ✅ Starts fresh game if data is corrupted
- ✅ Error is logged but not displayed to user

### Test Case 9.2: Browser Compatibility
**Objective**: Verify cross-browser functionality

**Steps**:
1. Test on Chrome, Firefox, Safari
2. Test on different OS (Windows, macOS, iOS, Android)
3. Verify feature parity

**Expected Results**:
- ✅ Core functionality works across browsers
- ✅ Swipe gestures work on touch devices
- ✅ Visual styling consistent (allowing for browser differences)

---

## 10. Completion and Finishing

### Test Case 10.1: Game Completion
**Objective**: Verify proper game ending experience

**Steps**:
1. Complete all holes for all players
2. Verify "🏆 Finish" button appears
3. Click finish button
4. Verify winner announcement

**Expected Results**:
- ✅ Finish button appears when all players complete all holes
- ✅ Winner announcement shows correct player and score
- ✅ Par comparison is accurate

---

## Sign-off Criteria

For QC approval, ALL test cases must pass with no critical or high-priority issues. Medium and low-priority issues can be documented for future fixes but don't block release.

**Test Completion Checklist**:
- [ ] All user flows work correctly
- [ ] Visual design meets specifications
- [ ] Navigation works on all devices
- [ ] Score input and validation functional
- [ ] Mobile responsiveness verified
- [ ] Session storage working properly
- [ ] Accessibility requirements met
- [ ] Performance acceptable
- [ ] Edge cases handled gracefully
- [ ] Cross-browser compatibility confirmed

**Tester**: _________________ **Date**: _________________ **Sign-off**: _________________