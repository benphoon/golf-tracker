# Authentication System Manual Test Plan

## Overview
Comprehensive manual testing checklist for ShotMate authentication and round saving features.

## Prerequisites
- Supabase project configured with test database
- Environment variables set correctly
- Development server running (`npm run dev`)

---

## Test Category 1: Guest User Experience

### Test 1.1: Guest Mode Functionality
**Objective**: Verify guest users can use all core features without authentication

**Steps**:
1. Open app without signing in
2. Start a new round (9 or 18 holes)
3. Add 2+ players in player setup
4. Complete at least 3 holes of scoring
5. Verify scores persist in session storage

**Expected Results**:
- ✅ All scoring functionality works
- ✅ Data persists during browser session
- ✅ No authentication prompts block core functionality
- ✅ "Sign In" button visible in header

### Test 1.2: Guest Round Completion Flow
**Objective**: Test auth prompt when guest completes round

**Steps**:
1. Complete a full 9-hole round as guest
2. Click "🏆 Finish Round" button
3. Observe auth modal appearance
4. Test "Continue as Guest" option
5. Test "Create Account" option

**Expected Results**:
- ✅ Auth modal appears with save round prompt
- ✅ "Continue as Guest" dismisses modal
- ✅ "Create Account" starts signup flow
- ✅ Modal title: "Save this round?"

---

## Test Category 2: Account Creation & Authentication

### Test 2.1: Sign Up Flow
**Objective**: Test new user account creation

**Steps**:
1. Click "Sign In" button in header
2. Switch to "Sign Up" tab
3. Enter email: `test+{timestamp}@example.com`
4. Enter password: `testpassword123`
5. Confirm password: `testpassword123`
6. Click "Create Account"

**Expected Results**:
- ✅ Account created successfully
- ✅ Modal closes automatically
- ✅ Header shows user avatar/email
- ✅ User profile created in database

### Test 2.2: Sign Up Validation
**Objective**: Test form validation during signup

**Test Cases**:
1. **Empty fields**: Try submitting without filling fields
2. **Invalid email**: Use invalid email format
3. **Short password**: Use password < 6 characters
4. **Password mismatch**: Different password and confirmation
5. **Duplicate email**: Try signing up with existing email

**Expected Results**:
- ✅ Appropriate error messages for each case
- ✅ Form prevents submission with invalid data
- ✅ No network requests with invalid data

### Test 2.3: Sign In Flow
**Objective**: Test existing user login

**Steps**:
1. Create account (or use existing)
2. Sign out
3. Click "Sign In" button
4. Enter credentials
5. Click "Sign In"

**Expected Results**:
- ✅ Successful login
- ✅ Header updates with user info
- ✅ Round history becomes accessible

### Test 2.4: Sign In Validation
**Objective**: Test login error handling

**Test Cases**:
1. **Wrong password**: Valid email, wrong password
2. **Non-existent email**: Email not in system
3. **Empty fields**: Missing email or password

**Expected Results**:
- ✅ Clear error messages
- ✅ No sensitive information disclosed
- ✅ Form remains functional after errors

---

## Test Category 3: Round Saving & History

### Test 3.1: Automatic Round Saving
**Objective**: Test authenticated users get automatic saving

**Steps**:
1. Sign in to account
2. Complete a full round
3. Click "💾 Save Round" button
4. Verify success message appears

**Expected Results**:
- ✅ Button shows "💾 Save Round" (not "🏆 Finish Round")
- ✅ Success message: "Round saved successfully! 🎉"
- ✅ Round appears in database
- ✅ Session storage cleared after save

### Test 3.2: Round History Display
**Objective**: Test round history page functionality

**Steps**:
1. Save 2-3 rounds with different configurations
2. Navigate to Round History (via user menu or splash page)
3. Verify round list displays correctly
4. Expand round details
5. Test navigation back to main app

**Expected Results**:
- ✅ Rounds displayed chronologically (newest first)
- ✅ Each round shows: date, title, scores, player count
- ✅ Round details show hole-by-hole scores
- ✅ Leaderboard with trophy icons
- ✅ Par comparison calculations correct

### Test 3.3: Round History with Multiple Players
**Objective**: Test multiplayer round display

**Steps**:
1. Complete round with 3-4 players
2. Enter varied scores (some above/below par)
3. Save round
4. View in round history
5. Expand to see details

**Expected Results**:
- ✅ All players displayed correctly
- ✅ Scores ranked properly (best to worst)
- ✅ Trophy icons for top 3 players
- ✅ Hole-by-hole scores in readable table

### Test 3.4: Empty History State
**Objective**: Test UI for users with no saved rounds

**Steps**:
1. Create new account
2. Navigate to Round History
3. Verify empty state display

**Expected Results**:
- ✅ "No rounds yet" message with illustration
- ✅ "Play your first round" call-to-action
- ✅ Helpful messaging encourages usage

---

## Test Category 4: Session & State Management

### Test 4.1: Session Persistence
**Objective**: Test authentication persists across browser sessions

**Steps**:
1. Sign in to account
2. Close browser completely
3. Reopen and navigate to app
4. Verify still logged in

**Expected Results**:
- ✅ User remains authenticated
- ✅ No need to sign in again
- ✅ Round history accessible

### Test 4.2: Guest Data Migration
**Objective**: Test guest round data handling after auth

**Steps**:
1. Start round as guest
2. Enter partial scores (3-4 holes)
3. Sign up for account during round
4. Verify round state preserved

**Expected Results**:
- ✅ Round progress maintained
- ✅ Can continue scoring from where left off
- ✅ Round saves properly when completed

### Test 4.3: Sign Out Functionality
**Objective**: Test complete logout process

**Steps**:
1. Sign in and navigate through app
2. Click user menu and "Sign Out"
3. Verify logout completes
4. Try accessing protected features

**Expected Results**:
- ✅ Header updates to show "Sign In" button
- ✅ Round history no longer accessible
- ✅ Guest mode functionality restored
- ✅ Session storage separate from account data

---

## Test Category 5: Mobile & Responsive Testing

### Test 5.1: Mobile Authentication
**Objective**: Test auth flows on mobile devices

**Steps**:
1. Test on actual mobile device or browser dev tools
2. Sign up using mobile interface
3. Test form usability and keyboard behavior
4. Verify modal displays properly

**Expected Results**:
- ✅ Auth modal is full-screen on mobile
- ✅ Input fields have proper keyboard types
- ✅ Touch targets are adequately sized
- ✅ Form scrolls properly if needed

### Test 5.2: Round History on Mobile
**Objective**: Test history page mobile experience

**Steps**:
1. Access round history on mobile
2. Test expanding/collapsing round details
3. Verify table scrolling for hole-by-hole scores
4. Test navigation elements

**Expected Results**:
- ✅ Cards stack properly on mobile
- ✅ Round details expand smoothly
- ✅ Score tables scroll horizontally if needed
- ✅ All touch targets work correctly

---

## Test Category 6: Error Handling & Edge Cases

### Test 6.1: Network Error Handling
**Objective**: Test behavior during network issues

**Steps**:
1. Disconnect internet during auth flow
2. Try to save round without connection
3. Test app behavior when connection restored

**Expected Results**:
- ✅ Appropriate error messages shown
- ✅ App doesn't crash or hang
- ✅ Graceful retry mechanisms where possible

### Test 6.2: Invalid Authentication States
**Objective**: Test edge cases in auth state

**Test Cases**:
1. **Corrupted session data**: Manually corrupt auth tokens
2. **Expired session**: Test with expired tokens
3. **Malformed user data**: Test with missing user fields

**Expected Results**:
- ✅ App handles corruption gracefully
- ✅ Automatic sign-out for invalid states
- ✅ Clear error messages for users

### Test 6.3: Database Connection Issues
**Objective**: Test behavior when Supabase is unavailable

**Steps**:
1. Configure invalid Supabase URL
2. Try authentication flows
3. Verify error handling

**Expected Results**:
- ✅ Clear error messages
- ✅ App remains functional in guest mode
- ✅ No data loss for guest sessions

---

## Test Category 7: Cross-Browser Compatibility

### Test 7.1: Browser Support
**Browsers to Test**:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

**Test Cases**:
1. Authentication flows work identically
2. Session persistence across browser restarts
3. Local storage and cookie behavior
4. Modal display and interactions

### Test 7.2: Incognito/Private Mode
**Objective**: Test behavior in private browsing

**Steps**:
1. Open app in incognito/private mode
2. Test full authentication flow
3. Verify session doesn't persist after browser close

**Expected Results**:
- ✅ All functionality works normally
- ✅ Sessions don't persist (expected behavior)
- ✅ No authentication leakage between sessions

---

## Test Category 8: Performance & Loading

### Test 8.1: Authentication Performance
**Objective**: Verify auth flows are responsive

**Metrics to Monitor**:
- Sign in/up response time < 3 seconds
- Round saving < 2 seconds
- Round history load < 3 seconds
- Session restoration < 1 second

### Test 8.2: Large Data Sets
**Objective**: Test with many saved rounds

**Steps**:
1. Save 20+ rounds with varying player counts
2. Test round history performance
3. Verify pagination or loading strategies

**Expected Results**:
- ✅ History loads in reasonable time
- ✅ UI remains responsive
- ✅ Memory usage stays reasonable

---

## Sign-Off Criteria

For manual testing approval, ALL test categories must pass with:
- ✅ **Critical functionality**: 100% pass rate
- ✅ **Error handling**: Graceful degradation, clear messaging
- ✅ **Security**: No unauthorized data access
- ✅ **Performance**: Meets response time requirements
- ✅ **Usability**: Intuitive user experience
- ✅ **Accessibility**: Basic accessibility standards met

**Tester**: _________________ **Date**: _________________ **Sign-off**: _________________