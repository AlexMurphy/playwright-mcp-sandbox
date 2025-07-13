# Omaze Entry Purchase Flow - Playwright Tests

This repository contains comprehensive Playwright tests for the Omaze UK entry purchase flow, built specifically for mobile Safari testing (iPhone 15 Pro Max configuration).

## Overview

The test suite follows the requirements from `generate_tests.prompt.md` and implements comprehensive testing for the Omaze entry purchase functionality, including:

- **Entry Purchase Flow Testing**: Complete end-to-end testing from homepage to checkout
- **Accessibility Testing**: ARIA compliance, keyboard navigation, and mobile accessibility
- **Network & Data Layer Testing**: Performance monitoring, API calls, and analytics tracking
- **Mobile-First Approach**: Optimized for iPhone 15 Pro Max Safari testing

## Test Structure

### Core Test Files

1. **`core-entry-process.spec.ts`** - Core entry purchase flow tests (recommended for quick validation)
2. **`entry-purchase-flow.spec.ts`** - Comprehensive entry purchase scenarios
3. **`accessibility.spec.ts`** - Accessibility compliance and keyboard navigation tests
4. **`network-data.spec.ts`** - Network performance and data layer monitoring tests

### Page Object Model

**`page-objects/omaze-pages.ts`** contains:
- **OmazePage**: Homepage interactions and navigation
- **EntryPage**: Entry method selection and package purchasing
- **CartPage**: Shopping cart functionality and validation
- **CheckoutPage**: Customer information form and payment flow

## Key Features

### 🎯 Entry Purchase Flow Coverage
- Single purchase entry selection
- Cart functionality (quantity modification, removal)
- Checkout form validation
- Express checkout options (PayPal, Google Pay, Shop Pay)
- Terms and conditions verification

### ♿ Accessibility Testing
- ARIA label verification
- Keyboard navigation testing
- Touch target size validation (44x44px minimum)
- Screen reader compatibility
- Focus management and tab order

### 📊 Performance & Analytics
- Page load performance monitoring
- Google Analytics/GTM data layer tracking
- API call monitoring during checkout
- Third-party integration verification
- Mobile performance optimization checks

### 🔧 Technical Implementation
- **Cookie Consent Handling**: Automatic OneTrust banner dismissal
- **Mobile Viewport**: iPhone 15 Pro Max configuration
- **Error Handling**: Robust locator strategies with fallbacks
- **Force Clicks**: Handles overlapping elements gracefully

## Running Tests

### Quick Start (Recommended)
```bash
# Run core tests - fastest validation
npx playwright test tests/core-entry-process.spec.ts --headed

# Run specific test category
npx playwright test tests/entry-purchase-flow.spec.ts --headed
npx playwright test tests/accessibility.spec.ts --headed
npx playwright test tests/network-data.spec.ts --headed
```

### Full Test Suite
```bash
# Run all tests
npx playwright test --headed

# Run tests in headless mode
npx playwright test

# Generate and view HTML report
npx playwright test
npx playwright show-report
```

### Individual Test Execution
```bash
# Run a specific test
npx playwright test tests/entry-purchase-flow.spec.ts:17 --headed

# Debug mode with inspector
npx playwright test tests/core-entry-process.spec.ts --debug
```

## Configuration

### Playwright Configuration (`playwright.config.ts`)
- **Base URL**: `https://omaze.co.uk`
- **Device**: iPhone 15 Pro Max
- **Browser**: Mobile Safari (WebKit)
- **Timeout**: 30 seconds per test
- **Retries**: 1 retry on CI, 0 locally

### Test Annotations
All tests include detailed annotations:
```typescript
test.info().annotations.push({
  type: 'feature|accessibility|performance|mobile',
  description: 'Detailed description of test purpose'
});
```

## Test Scenarios Covered

### Entry Purchase Flow
✅ Complete single purchase flow (homepage → checkout)  
✅ Cart quantity modification and item removal  
✅ Checkout form validation and error handling  
✅ Mobile navigation and responsiveness  
✅ Entry method verification (Single/Subscription/Postal)  
✅ Customer information form completion  
✅ Express checkout options validation  
✅ Terms and conditions link verification  

### Accessibility Compliance
✅ Homepage accessibility checks  
✅ Entry page keyboard navigation  
✅ Cart accessibility features  
✅ Checkout form ARIA labels  
✅ Mobile touch accessibility (44x44px targets)  
✅ Color contrast and visual accessibility  
✅ Screen reader announcements  
✅ Focus management and tab order  

### Network & Performance
✅ Page load performance monitoring  
✅ Data layer events tracking  
✅ API calls during checkout process  
✅ Third-party integrations verification  
✅ Form submission network calls  
✅ Mobile performance optimization  

## Known Issues & Solutions

### Cookie Consent Banner
**Issue**: OneTrust cookie banner blocks interactions  
**Solution**: Automatic banner dismissal implemented in `OmazePage.handleCookieConsent()`

### Strict Mode Violations
**Issue**: Multiple elements with same text/locator  
**Solution**: Use `.first()` or more specific selectors

### Mobile Touch Targets
**Issue**: Some elements may be smaller than 44x44px  
**Solution**: Touch target size validation in accessibility tests

## Expected Test Results

### Successful Test Run
- **Entry Purchase Flow**: All scenarios should pass
- **Accessibility**: ARIA compliance and keyboard navigation verified
- **Network**: Performance metrics within acceptable ranges
- **Mobile**: Touch targets and responsive design validated

### Typical Performance Metrics
- Page load time: < 5 seconds
- Total requests: < 100 per flow
- Data transfer: < 10MB for mobile experience
- API response times: < 2 seconds

## Troubleshooting

### Common Issues
1. **Cookie Banner Timeout**: Increase timeout in `handleCookieConsent()`
2. **Element Not Found**: Verify selectors against current page structure
3. **Network Timeout**: Check internet connection and site availability
4. **Mobile Viewport Issues**: Ensure iPhone 15 Pro Max config is correct

### Debug Tools
```bash
# Run with trace for detailed debugging
npx playwright test --trace on

# Generate screenshot on failure
npx playwright test --screenshot only-on-failure
```

## File Structure
```
tests/
├── core-entry-process.spec.ts      # Quick validation tests
├── entry-purchase-flow.spec.ts     # Comprehensive purchase flow
├── accessibility.spec.ts           # Accessibility compliance
├── network-data.spec.ts           # Performance & analytics
├── page-objects/
│   └── omaze-pages.ts              # Page Object Model
└── global-setup.ts                # Test configuration
```

## Contributing

When adding new tests:
1. Follow the Page Object Model pattern
2. Include test annotations for categorization
3. Handle cookie consent in page interactions
4. Use mobile-appropriate assertions
5. Add performance/accessibility checks where relevant

## Test Categories

| Category | Purpose | Key Tests |
|----------|---------|-----------|
| **Core** | Essential flow validation | Entry process, mobile responsiveness |
| **Accessibility** | WCAG compliance | ARIA, keyboard nav, touch targets |
| **Network** | Performance monitoring | Load times, API calls, analytics |
| **Flow** | User journey validation | Cart, checkout, form validation |

This test suite provides comprehensive coverage of the Omaze entry purchase functionality with a focus on mobile accessibility and performance testing.
