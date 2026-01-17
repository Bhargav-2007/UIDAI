# Design Document: Analytics Dashboard

## Overview

The Analytics Dashboard transforms a text-only UI into a fully functional data visualization system. The architecture consists of three main layers:

1. **API Service Layer**: Centralized HTTP client for backend communication with error handling
2. **Chart Component Layer**: Reusable, type-safe chart components supporting multiple visualization types
3. **Page Components Layer**: Analytics section pages that orchestrate data fetching, KPI calculation, and chart rendering

The system fetches real data from a FastAPI backend, validates it, calculates KPIs, and renders interactive charts using Chart.js. A Before/After toggle allows users to compare raw versus analyzed data across all sections.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Analytics Page Components                     │   │
│  │  (Executive Summary, Fraud Detection, etc.)          │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      Universal Chart Component                        │   │
│  │  (Renders line, bar, scatter, pie charts)            │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │      API Service Layer                                │   │
│  │  (HTTP client, error handling, data validation)      │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
        ┌─────────────────────────────────────┐
        │   FastAPI Backend (localhost:8000)   │
        │   - Executive Summary endpoint       │
        │   - Descriptive Analytics endpoint   │
        │   - Fraud Detection endpoint         │
        │   - Outlier Detection endpoint       │
        │   - Operational Efficiency endpoint  │
        │   - Forecasting endpoint             │
        │   - Geographic Analysis endpoint     │
        │   - Benchmarking endpoint            │
        │   - AI Risk Scoring endpoint         │
        └─────────────────────────────────────┘
```

## Components and Interfaces

### 1. API Service Layer (`services/analyticsApi.ts`)

**Purpose**: Centralized HTTP client for all backend communication

**Interface**:
```typescript
interface AnalyticsApiService {
  // Fetch data for each analytics section
  getExecutiveSummary(before?: boolean): Promise<AnalyticsData>
  getDescriptiveAnalytics(before?: boolean): Promise<AnalyticsData>
  getFraudDetection(before?: boolean): Promise<AnalyticsData>
  getOutlierDetection(before?: boolean): Promise<AnalyticsData>
  getOperationalEfficiency(before?: boolean): Promise<AnalyticsData>
  getForecasting(before?: boolean): Promise<AnalyticsData>
  getGeographicAnalysis(before?: boolean): Promise<AnalyticsData>
  getBenchmarking(before?: boolean): Promise<AnalyticsData>
  getAiRiskScoring(before?: boolean): Promise<AnalyticsData>
}

interface AnalyticsData {
  labels: string[]
  datasets: Dataset[]
  kpis: KPI[]
  chartType: 'line' | 'bar' | 'scatter' | 'pie'
  title: string
}

interface Dataset {
  label: string
  data: number[]
  borderColor?: string
  backgroundColor?: string
  fill?: boolean
}

interface KPI {
  label: string
  value: number | string
  format?: 'number' | 'percentage' | 'currency'
}

interface ApiError {
  message: string
  status?: number
  endpoint?: string
}
```

**Responsibilities**:
- Make HTTP requests to backend endpoints
- Validate response structure and data types
- Handle network errors and HTTP error codes
- Return structured AnalyticsData or throw ApiError
- Support before/after data variants

### 2. Universal Chart Component (`components/AnalyticsChart.tsx`)

**Purpose**: Reusable component for rendering different chart types

**Props**:
```typescript
interface AnalyticsChartProps {
  chartType: 'line' | 'bar' | 'scatter' | 'pie'
  data: ChartData
  title: string
  kpis: KPI[]
  isLoading?: boolean
  error?: string
  onRetry?: () => void
}

interface ChartData {
  labels: string[]
  datasets: Dataset[]
}
```

**Behavior**:
- Renders appropriate Chart.js chart based on `chartType` prop
- Displays KPIs above or beside the chart
- Shows loading state while data is being fetched
- Displays error message with retry button if error occurs
- Updates chart when data changes
- Handles empty or invalid data gracefully

**Chart Type Configurations**:
- **Line Chart**: For trends over time (Executive Summary, Operational Efficiency, Forecasting)
- **Bar Chart**: For categorical comparisons (Descriptive Analytics, Fraud Detection, Benchmarking, AI Risk Scoring)
- **Scatter Chart**: For outlier visualization (Outlier Detection)
- **Pie Chart**: For distribution/composition (Geographic Analysis)

### 3. Analytics Page Components

Each analytics section has a dedicated page component that:
1. Fetches data from API service
2. Handles loading and error states
3. Manages Before/After toggle state
4. Calculates or receives KPIs
5. Renders AnalyticsChart component

**Common Page Structure**:
```typescript
interface AnalyticsPageProps {
  title: string
  endpoint: (before?: boolean) => Promise<AnalyticsData>
}

// Page component lifecycle:
// 1. Mount → Fetch "after" data by default
// 2. User toggles Before/After → Fetch corresponding data
// 3. Error occurs → Display error message with retry
// 4. Data received → Render chart and KPIs
```

**Pages to Implement**:
- ExecutiveSummaryPage
- DescriptiveAnalyticsPage
- FraudDetectionPage
- OutlierDetectionPage
- OperationalEfficiencyPage
- ForecastingPage
- GeographicAnalysisPage
- BenchmarkingPage
- AiRiskScoringPage

### 4. Before/After Toggle Component (`components/BeforeAfterToggle.tsx`)

**Purpose**: Allow users to switch between raw and analyzed data views

**Props**:
```typescript
interface BeforeAfterToggleProps {
  value: 'before' | 'after'
  onChange: (value: 'before' | 'after') => void
}
```

**Behavior**:
- Displays two buttons: "Before" and "After"
- Highlights the active state
- Calls onChange callback when toggled
- State is local to the page (resets on navigation)

## Data Models

### AnalyticsData Structure

All backend responses follow this structure:

```typescript
{
  labels: ["Jan", "Feb", "Mar", ...],
  datasets: [
    {
      label: "Series 1",
      data: [10, 20, 15, ...],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 243, 0.1)",
      fill: true
    }
  ],
  kpis: [
    { label: "Total", value: 1250, format: "number" },
    { label: "Average", value: 41.67, format: "number" },
    { label: "Growth", value: 12.5, format: "percentage" }
  ],
  chartType: "line",
  title: "Executive Summary"
}
```

### Error Response Structure

```typescript
{
  message: "Failed to fetch data",
  status: 500,
  endpoint: "/api/executive-summary"
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.


### Property 1: API Error Handling Consistency
*For any* network error or HTTP error response from the Backend_API, the API service SHALL return an error object containing both a message and status code.
**Validates: Requirements 1.2, 1.5**

### Property 2: Data Validation Rejection
*For any* malformed or invalid response data from the Backend_API, the API service SHALL reject the data and return an error instead of passing invalid data to components.
**Validates: Requirements 1.3**

### Property 3: Chart Rendering for Valid Data
*For any* valid chart data with a specified chart type (line, bar, scatter, or pie), the AnalyticsChart component SHALL render the correct chart type without errors.
**Validates: Requirements 3.2**

### Property 4: Invalid Data Error Display
*For any* invalid or missing chart data provided to the AnalyticsChart component, the component SHALL display an error message instead of rendering a broken chart.
**Validates: Requirements 3.3**

### Property 5: Chart Update Consistency
*For any* sequence of data updates to the AnalyticsChart component, the component SHALL render the latest data correctly without stale data or memory leaks.
**Validates: Requirements 3.5**

### Property 6: KPI Display Minimum Count
*For any* analytics page displaying data, the page SHALL display at least three numeric KPIs alongside the chart.
**Validates: Requirements 4.3, 5.3, 6.3, 7.3, 8.3, 9.3, 10.3, 11.3, 12.3, 14.1**

### Property 7: Before/After Toggle Data Switch
*For any* analytics page with Before/After toggle, toggling between "Before" and "After" states SHALL update both the chart and KPIs to display the corresponding data.
**Validates: Requirements 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.2, 13.3, 13.4**

### Property 8: KPI Label Presence
*For any* KPI displayed on an analytics page, the KPI SHALL include a descriptive label explaining what the metric represents.
**Validates: Requirements 14.2**

### Property 9: KPI Numeric Formatting
*For any* numeric KPI value displayed on an analytics page, the value SHALL be formatted appropriately (with decimals, percentages, or thousands separators as needed).
**Validates: Requirements 14.3**

### Property 10: Error Message Content
*For any* API request failure, the error message displayed to the user SHALL include information about what failed (e.g., section name) and SHALL NOT contain technical stack traces or internal error details.
**Validates: Requirements 15.2, 15.3**

### Property 11: No Emoji Characters
*For any* UI text, label, or description in the Analytics_Dashboard, the text SHALL NOT contain any emoji characters.
**Validates: Requirements 16.1**

### Property 12: No Placeholder Text
*For any* UI text displayed in the Analytics_Dashboard, the text SHALL NOT contain placeholder phrases such as "Coming Soon" or "Not Implemented".
**Validates: Requirements 16.2, 16.5, 18.5**

### Property 13: No Decorative Symbols
*For any* UI element in the Analytics_Dashboard, the element SHALL NOT contain decorative symbols or non-functional characters.
**Validates: Requirements 16.4**

### Property 14: Navigation Link Activation
*For any* analytics page loaded, the corresponding sidebar navigation link SHALL be highlighted as active to indicate the current page.
**Validates: Requirements 18.3**

### Property 15: Sidebar Persistence
*For any* navigation between analytics pages, the sidebar SHALL remain visible and functional on all pages.
**Validates: Requirements 18.4**

### Property 16: Navigation Functionality
*For any* sidebar navigation link clicked, the Analytics_Dashboard SHALL load the corresponding analytics page.
**Validates: Requirements 18.2**

## Error Handling

### API Error Handling Strategy

1. **Network Errors**: When the backend is unreachable, display "Unable to connect to analytics service. Please check your connection."
2. **HTTP Errors**: When the backend returns 4xx or 5xx status, display "Failed to load [Section Name] data. Status: [code]"
3. **Invalid Data**: When response data doesn't match expected structure, display "Received invalid data format from analytics service"
4. **Retry Mechanism**: All error states include a "Retry" button that re-triggers the data fetch

### Component Error Boundaries

- AnalyticsChart component catches rendering errors and displays error message
- Page components catch API errors and display error message with retry
- No errors should propagate to crash the entire application

### User-Facing Error Messages

All error messages follow this pattern:
- Clear description of what failed
- No technical jargon or stack traces
- Actionable next step (usually "Retry")
- Consistent styling and positioning

## Testing Strategy

### Unit Testing Approach

Unit tests verify specific examples and edge cases:

1. **API Service Tests**
   - Test successful API calls return correct data structure
   - Test network errors are caught and formatted correctly
   - Test invalid response data is rejected
   - Test all eight endpoint methods exist and are callable

2. **AnalyticsChart Component Tests**
   - Test rendering each chart type (line, bar, scatter, pie)
   - Test error state displays error message
   - Test loading state displays loading indicator
   - Test KPI display with various data formats
   - Test chart updates when props change

3. **Page Component Tests**
   - Test page loads and fetches data on mount
   - Test Before/After toggle switches data
   - Test error state displays error message with retry button
   - Test sidebar link is highlighted when page is active

4. **Integration Tests**
   - Test full flow: navigate to page → fetch data → render chart and KPIs
   - Test Before/After toggle updates both chart and KPIs
   - Test error recovery: trigger error → click retry → data loads

### Property-Based Testing Approach

Property tests verify universal properties across many generated inputs:

1. **API Service Properties**
   - For any network error, error object contains message and status
   - For any invalid data, service rejects it and returns error
   - For any valid data, service returns it unchanged

2. **Chart Component Properties**
   - For any valid chart data, correct chart type is rendered
   - For any invalid data, error message is displayed
   - For any sequence of data updates, latest data is rendered correctly

3. **KPI Display Properties**
   - For any analytics data, at least three KPIs are displayed
   - For any KPI, a descriptive label is present
   - For any numeric KPI, value is formatted appropriately

4. **UI Content Properties**
   - For any UI text, no emoji characters are present
   - For any UI text, no placeholder text is present
   - For any UI element, no decorative symbols are present

5. **Navigation Properties**
   - For any page loaded, corresponding sidebar link is highlighted
   - For any navigation action, sidebar remains visible
   - For any sidebar link clicked, correct page loads

### Test Configuration

- Minimum 100 iterations per property-based test
- Each property test tagged with: `Feature: analytics-dashboard, Property N: [property text]`
- Unit tests focus on specific examples and edge cases
- Property tests focus on universal correctness across all inputs
- Both unit and property tests are required for comprehensive coverage

