# Codebase Summary

## Project Structure
- `/src`: Main source code directory
  - `main.tsx`: Application entry point with LaunchDarkly provider
  - `App.tsx`: Root component with A/B testing implementation
  - `index.css`: Global styles
  - `App.css`: Component-specific styles
  - `vite-env.d.ts`: Vite type declarations
  - `/components`: UI components
    - `/ui`: shadcn UI components
    - `TestResultsChart.tsx`: Bar chart visualization for test results
- `/public`: Static assets
- Configuration files in root:
  - `vite.config.ts`
  - `tsconfig.json`
  - `package.json`

## Key Components and Their Interactions
- Entry Point (main.tsx):
  - Configures LaunchDarkly provider
  - Uses asyncWithLDProvider for initialization
  - Wraps App component with LaunchDarkly provider

- App Component (App.tsx):
  - Implements useFlags hook for feature flag management
  - Manages test simulation with configurable parameters:
    - Normal Mode: 10% error rate for all versions
    - Extreme Mode: 80% error rate for Version B, 10% for Version A
    - Consistent latency range (110-130ms)
  - Provides real-time visualization and statistics
  - Implements comprehensive error tracking and latency monitoring

- TestResultsChart Component:
  - Visualizes test results using Recharts
  - Shows success vs error counts
  - Updates in real-time as tests run

## Data Flow
- LaunchDarkly Integration:
  - Provider initialized in main.tsx
  - Feature flags accessible via useFlags hook
  - Real-time updates via LaunchDarkly's streaming architecture
  - Local storage bootstrapping for offline support

- Test Simulation Flow:
  - User context generation for each test
  - Consistent latency simulation (110-130ms)
  - Error rate simulation based on mode and version
  - Real-time metrics tracking and visualization
  - Comprehensive event tracking via LaunchDarkly

## External Dependencies
### Core Dependencies
- React
- TypeScript
- Vite

### Feature Management
- LaunchDarkly React SDK
  - Purpose: Feature flag management
  - Integration: Application root level
  - Features:
    - Real-time flag updates
    - Local storage bootstrapping
    - React hooks integration

### UI and Visualization
- shadcn-ui: Component library
- Recharts: Data visualization
- Sonner: Toast notifications

## Recent Changes
- Refactored simulation logic for consistent behavior
- Updated error rate configuration:
  - Standardized 10% base error rate
  - Implemented 80% error rate for Version B in extreme mode
- Standardized latency simulation (110-130ms range)
- Renamed extremeLatency to extremeMode for clarity
- Enhanced UI feedback and statistics display
- Improved code organization and documentation

## User Feedback Integration
- Clear visual indication of test mode and configuration
- Real-time statistics and progress tracking
- Enhanced error rate and latency visualization
- Comprehensive test configuration display
- Improved toast notifications for test events
