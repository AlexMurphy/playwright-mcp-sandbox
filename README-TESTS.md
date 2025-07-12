# Omaze UK Test Suite

This comprehensive test suite covers the Omaze UK website (https://omaze.com) functionality, user journeys, accessibility, and performance aspects.

## Test Files Overview

### 1. `omaze-comprehensive.spec.ts`
Main comprehensive test suite covering:
- Homepage functionality and house draw information
- Navigation to entry page and entry methods
- Subscription and pricing verification
- FAQ content organization
- Header navigation and footer links
- Charity information display
- Trustpilot integration
- Draw timing and Early Bird prizes
- House gallery and property information
- Authentication features
- Cookie consent mechanism
- Mobile responsiveness basics

### 2. `user-journey.spec.ts`
Focused user journey tests covering:
- Complete entry flows (single purchase, subscription, postal)
- Navigation flows between main sections
- House tour and gallery interactions
- Early Bird prize information flow
- Charity information deep dive
- Footer links comprehensive testing

### 3. `accessibility-performance.spec.ts`
Accessibility and performance focused tests:
- Page titles and meta information
- Heading hierarchy structure
- Navigation accessibility
- Button and interactive element accessibility
- Form accessibility
- Image alt text and media accessibility
- Keyboard navigation support
- Page load performance
- Responsive design across viewports
- Error state handling
- ARIA landmarks and structure
- Color contrast and visual accessibility

### 4. `edge-cases.spec.ts`
Edge cases and error handling tests:
- Network interruption handling
- Rapid user interactions
- Cookie acceptance variations
- Direct URL access to various pages
- Browser back/forward navigation
- Page refresh during interactions
- External link behavior
- Form validation edge cases
- Image loading failure handling
- Countdown timer edge cases
- Subscription tier edge cases
- FAQ expandable content
- Charity information consistency
- Window resizing during use

## Running the Tests

### Prerequisites
- Node.js (v16 or higher)
- npm or pnpm package manager

### Installation
```bash
# Install dependencies
pnpm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

```bash
# Run all tests
npx playwright test

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test omaze-comprehensive.spec.ts

# Run tests for specific browser
npx playwright test --project=chromium

# Run tests with debug mode
npx playwright test --debug

# Run tests on mobile
npx playwright test --project="Mobile Chrome"
```

### Test Reports

After running tests, you can view the HTML report:
```bash
npx playwright show-report
```

Test artifacts are saved in:
- `test-results/` - Screenshots, videos, traces
- `playwright-report/` - HTML test report
- `tests/screenshots/` - Custom accessibility screenshots

## Test Configuration

The tests are configured in `playwright.config.ts` with:

- **Base URL**: `https://omaze.co.uk`
- **Timeouts**: 10s for actions, 30s for navigation
- **Browsers**: Chrome, Firefox, Safari, Edge, Mobile Chrome, Mobile Safari
- **Screenshots**: Taken on failure
- **Videos**: Recorded on failure
- **Traces**: Collected on retry

## Key Test Features

### Comprehensive Coverage
- ✅ Main user journeys (browse, enter draw, subscribe)
- ✅ Navigation and routing
- ✅ Form interactions and validation
- ✅ Mobile responsiveness
- ✅ Accessibility compliance
- ✅ Performance monitoring
- ✅ Error handling and edge cases

### Real User Scenarios
- House draw entry process
- Subscription management
- Charity information verification
- Gallery and house tour navigation
- Cookie consent handling
- FAQ content accessibility

### Cross-Browser Testing
Tests run across multiple browsers and viewports to ensure compatibility:
- Desktop: Chrome, Firefox, Safari, Edge
- Mobile: Chrome on Pixel 5, Safari on iPhone 12

### Accessibility Testing
- ARIA landmarks and roles
- Keyboard navigation
- Screen reader compatibility
- Color contrast verification
- Heading structure validation

## Maintenance

### Updating Tests
When the website changes:
1. Update selectors in test files
2. Verify expected text content matches current site
3. Update pricing and entry information as needed
4. Check for new features or flows to test

### Adding New Tests
1. Follow existing file structure and naming conventions
2. Use descriptive test names and comments
3. Group related tests in appropriate describe blocks
4. Include both positive and negative test cases

### Test Data Management
- Use dynamic selectors where possible
- Extract reusable test data to constants
- Update charity and pricing information as campaigns change

## Troubleshooting

### Common Issues

**Tests timing out:**
- Increase timeout values in config
- Check network connectivity
- Verify website is accessible

**Element not found:**
- Update selectors if website structure changed
- Add wait conditions for dynamic content
- Check for cookie banners or popups

**Mobile tests failing:**
- Verify mobile-specific selectors
- Check viewport-dependent functionality
- Test on actual mobile devices if needed

### Debugging Tips

1. Run with `--headed` to see browser interactions
2. Use `--debug` for step-by-step debugging
3. Check screenshots in `test-results/` for visual verification
4. Use browser dev tools to inspect failing elements

## Contributing

When adding new tests:
1. Follow the existing test structure
2. Include comprehensive assertions
3. Test both happy path and error scenarios
4. Update this README with new test information
5. Ensure tests are cross-browser compatible

## Notes

- Tests use the live Omaze UK website
- Some tests depend on current draw information (Cheshire house)
- Pricing and entry information may need updates as campaigns change
- External link testing is limited to avoid navigating away from Omaze domain
