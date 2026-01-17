# Implementation Plan: Analytics Dashboard

## Overview

This implementation plan converts the text-only analytics UI into a fully functional dashboard with real data visualization. The approach follows a layered architecture: first establishing the API service layer, then building the universal chart component, and finally implementing each analytics page with data fetching and chart rendering. Each step builds incrementally with integrated testing to catch errors early.

## Tasks

- [x] 1. Set up project structure and install dependencies
  - Install Chart.js and react-chartjs-2 packages locally (no global installs or CDN)
  - Create directory structure: `src/services/`, `src/components/`, `src/pages/`
  - Set up TypeScript configuration for strict type checking
  - Verify all dependencies are installed and available
  - _Requirements: 2.1, 2.2, 17.4_

- [x] 2. Create API service layer
  - [x] 2.1 Implement analyticsApi.ts service module
    - Create AnalyticsApiService interface with all eight endpoint methods
    - Implement HTTP client with error handling and data validation
    - Add support for before/after data variants
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 2.2 Write property tests for API service error handling
    - **Property 1: API Error Handling Consistency**
    - **Property 2: Data Validation Rejection**
    - **Validates: Requirements 1.2, 1.3, 1.5**
  
  - [x] 2.3 Write unit tests for API service
    - Test successful API calls return correct data structure
    - Test network errors are caught and formatted correctly
    - Test all eight endpoint methods exist and are callable
    - _Requirements: 1.1, 1.4_

- [x] 3. Create universal AnalyticsChart component
  - [x] 3.1 Implement AnalyticsChart.tsx component
    - Accept chartType, data, title, kpis, isLoading, error, onRetry props
    - Render appropriate Chart.js chart based on chartType
    - Display KPIs above or beside the chart
    - Show loading state while data is being fetched
    - Display error message with retry button if error occurs
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 2.3, 2.4_
  
  - [x] 3.2 Write property tests for AnalyticsChart component
    - **Property 3: Chart Rendering for Valid Data**
    - **Property 4: Invalid Data Error Display**
    - **Property 5: Chart Update Consistency**
    - **Validates: Requirements 3.2, 3.3, 3.5**
  
  - [x] 3.3 Write unit tests for AnalyticsChart component
    - Test rendering each chart type (line, bar, scatter, pie)
    - Test error state displays error message
    - Test loading state displays loading indicator
    - Test KPI display with various data formats
    - Test chart updates when props change
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Create BeforeAfterToggle component
  - [x] 4.1 Implement BeforeAfterToggle.tsx component
    - Display two buttons: "Before" and "After"
    - Highlight the active state
    - Call onChange callback when toggled
    - _Requirements: 13.1, 13.2, 13.3_
  
  - [x] 4.2 Write unit tests for BeforeAfterToggle component
    - Test toggle switches between "Before" and "After" states
    - Test onChange callback is called with correct value
    - Test active state is highlighted correctly
    - _Requirements: 13.1, 13.2, 13.3_

- [x] 5. Implement Executive Summary analytics page
  - [x] 5.1 Create ExecutiveSummaryPage.tsx component
    - Fetch data from API service on mount
    - Manage Before/After toggle state
    - Display line chart with executive summary data
    - Display at least three numeric KPIs
    - Handle loading and error states
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 14.1, 14.2, 14.3_
  
  - [x] 5.2 Write property tests for Executive Summary page
    - **Property 6: KPI Display Minimum Count**
    - **Property 7: Before/After Toggle Data Switch**
    - **Property 8: KPI Label Presence**
    - **Property 9: KPI Numeric Formatting**
    - **Validates: Requirements 4.3, 4.5, 14.1, 14.2, 14.3**
  
  - [x] 5.3 Write unit tests for Executive Summary page
    - Test page fetches data on mount
    - Test line chart is rendered with correct data
    - Test at least three KPIs are displayed
    - Test Before/After toggle updates chart and KPIs
    - Test error state displays error message with retry
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 6. Implement Descriptive Analytics page
  - [ ] 6.1 Create DescriptiveAnalyticsPage.tsx component
    - Fetch data from API service on mount
    - Manage Before/After toggle state
    - Display bar chart with descriptive analytics data
    - Display at least three numeric KPIs
    - Handle loading and error states
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 14.1, 14.2, 14.3_
  
  - [ ] 6.2 Write unit tests for Descriptive Analytics page
    - Test page fetches data on mount
    - Test bar chart is rendered with correct data
    - Test at least three KPIs are displayed
    - Test Before/After toggle updates chart and KPIs
    - Test error state displays error message with retry
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 7. Implement Fraud Detection page
  - [ ] 7.1 Create FraudDetectionPage.tsx component
    - Fetch data from API service on mount
    - Manage Before/After toggle state
    - Display bar chart with fraud detection data
    - Display at least three numeric KPIs
    - Handle loading and error states
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 14.1, 14.2, 14.3_
  
  - [ ] 7.2 Write unit tests for Fraud Detection page
    - Test page fetches data on mount
    - Test bar chart is rendered with correct data
    - Test at least three KPIs are displayed
    - Test Before/After toggle updates chart and KPIs
    - Test error state displays error message with retry
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 8. Implement Outlier Detection page
  - [ ] 8.1 Create OutlierDetectionPage.tsx component
    - Fetch data from API service on mount
    - Manage Before/After toggle state
    - Display scatter chart with outlier detection data
    - Display at least three numeric KPIs
    - Handle loading and error states
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 14.1, 14.2, 14.3_
  
  - [ ] 8.2 Write unit tests for Outlier Detection page
    - Test page fetches data on mount
    - Test scatter chart is rendered with correct data
    - Test at least three KPIs are displayed
    - Test Before/After toggle updates chart and KPIs
    - Test error state displays error message with retry
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 9. Implement Operational Efficiency page
  - [ ] 9.1 Create OperationalEfficiencyPage.tsx component
    - Fetch data from API service on mount
    - Manage Before/After toggle state
    - Display line chart with operational efficiency data
    - Display at least three numeric KPIs
    - Handle loading and error states
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 14.1, 14.2, 14.3_
  
  - [ ] 9.2 Write unit tests for Operational Efficiency page
    - Test page fetches data on mount
    - Test line chart is rendered with correct data
    - Test at least three KPIs are displayed
    - Test Before/After toggle updates chart and KPIs
    - Test error state displays error message with retry
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 10. Implement Forecasting page
  - [ ] 10.1 Create ForecastingPage.tsx component
    - Fetch data from API service on mount
    - Manage Before/After toggle state
    - Display line chart with forecasting data
    - Display at least three numeric KPIs
    - Handle loading and error states
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 14.1, 14.2, 14.3_
  
  - [ ] 10.2 Write unit tests for Forecasting page
    - Test page fetches data on mount
    - Test line chart is rendered with correct data
    - Test at least three KPIs are displayed
    - Test Before/After toggle updates chart and KPIs
    - Test error state displays error message with retry
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 11. Implement Geographic Analysis page
  - [ ] 11.1 Create GeographicAnalysisPage.tsx component
    - Fetch data from API service on mount
    - Manage Before/After toggle state
    - Display pie chart with geographic analysis data
    - Display at least three numeric KPIs
    - Handle loading and error states
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 14.1, 14.2, 14.3_
  
  - [ ] 11.2 Write unit tests for Geographic Analysis page
    - Test page fetches data on mount
    - Test pie chart is rendered with correct data
    - Test at least three KPIs are displayed
    - Test Before/After toggle updates chart and KPIs
    - Test error state displays error message with retry
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 12. Implement Benchmarking page
  - [ ] 12.1 Create BenchmarkingPage.tsx component
    - Fetch data from API service on mount
    - Manage Before/After toggle state
    - Display bar chart with benchmarking data
    - Display at least three numeric KPIs
    - Handle loading and error states
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 14.1, 14.2, 14.3_
  
  - [ ] 12.2 Write unit tests for Benchmarking page
    - Test page fetches data on mount
    - Test bar chart is rendered with correct data
    - Test at least three KPIs are displayed
    - Test Before/After toggle updates chart and KPIs
    - Test error state displays error message with retry
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 13. Implement AI Risk Scoring page
  - [ ] 13.1 Create AiRiskScoringPage.tsx component
    - Fetch data from API service on mount
    - Manage Before/After toggle state
    - Display bar chart with AI risk scoring data
    - Display at least three numeric KPIs
    - Handle loading and error states
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 14.1, 14.2, 14.3_
  
  - [ ] 13.2 Write unit tests for AI Risk Scoring page
    - Test page fetches data on mount
    - Test bar chart is rendered with correct data
    - Test at least three KPIs are displayed
    - Test Before/After toggle updates chart and KPIs
    - Test error state displays error message with retry
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 14. Update sidebar navigation
  - [ ] 14.1 Update sidebar to include all analytics sections
    - Add navigation links for all eight analytics pages
    - Implement active link highlighting based on current page
    - Remove any placeholder or "Coming Soon" items
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_
  
  - [ ] 14.2 Write property tests for sidebar navigation
    - **Property 14: Navigation Link Activation**
    - **Property 15: Sidebar Persistence**
    - **Property 16: Navigation Functionality**
    - **Validates: Requirements 18.2, 18.3, 18.4**
  
  - [ ] 14.3 Write unit tests for sidebar navigation
    - Test all eight analytics sections are displayed
    - Test clicking a link navigates to correct page
    - Test active link is highlighted when page is loaded
    - Test sidebar remains visible across all pages
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [ ] 15. Implement error handling and user feedback
  - [ ] 15.1 Add error boundary and error display components
    - Create ErrorDisplay component for showing error messages
    - Implement error boundary to catch rendering errors
    - Add retry button to all error states
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_
  
  - [ ] 15.2 Write property tests for error handling
    - **Property 10: Error Message Content**
    - **Validates: Requirements 15.2, 15.3**
  
  - [ ] 15.3 Write unit tests for error handling
    - Test error messages are displayed for API failures
    - Test error messages include section name and status
    - Test error messages do not contain stack traces
    - Test retry button re-triggers data fetch
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 16. Remove emojis and placeholder text
  - [ ] 16.1 Audit all UI text and remove emojis
    - Scan all component files for emoji characters
    - Remove any emoji from labels, descriptions, and messages
    - _Requirements: 16.1, 16.4_
  
  - [ ] 16.2 Remove placeholder text
    - Remove "Coming Soon" and "Not Implemented" text
    - Remove any decorative symbols or non-functional text
    - _Requirements: 16.2, 16.3_
  
  - [ ] 16.3 Write property tests for UI content
    - **Property 11: No Emoji Characters**
    - **Property 12: No Placeholder Text**
    - **Property 13: No Decorative Symbols**
    - **Validates: Requirements 16.1, 16.2, 16.4**

- [ ] 17. Checkpoint - Ensure all tests pass
  - Run all unit tests and verify they pass
  - Run all property-based tests and verify they pass
  - Verify no console errors or warnings
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Integration testing and final verification
  - [ ] 18.1 Test full end-to-end flows
    - Navigate through all analytics pages
    - Verify data loads and charts render on each page
    - Test Before/After toggle on each page
    - Test error handling by simulating API failures
    - _Requirements: 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1, 11.1, 12.1_
  
  - [ ] 18.2 Write integration tests
    - Test full flow: navigate → fetch data → render chart and KPIs
    - Test Before/After toggle updates both chart and KPIs
    - Test error recovery: trigger error → click retry → data loads
    - _Requirements: 4.1, 4.5, 5.1, 5.5, 6.1, 6.5, 7.1, 7.5, 8.1, 8.5, 9.1, 9.5, 10.1, 10.5, 11.1, 11.5, 12.1, 12.5_

- [ ] 19. Final checkpoint - Verify GitHub Codespaces compatibility
  - Verify all features work in GitHub Codespaces browser environment
  - Test API requests to http://localhost:8000 succeed
  - Verify no global npm installs or CDN dependencies are used
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All code must work in GitHub Codespaces browser environment
- No emojis or placeholder text anywhere in the codebase

