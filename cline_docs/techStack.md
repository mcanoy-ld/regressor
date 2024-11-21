# Technology Stack

## Frontend Framework
- React (with TypeScript)
- Vite for build tooling and development server

## UI Components and Styling
- shadcn-ui (New York style)
- Tailwind CSS for styling
- CSS variables for consistent theming
- Neutral color palette as base
- Recharts for data visualization
  - Purpose: Interactive and responsive charts
  - Features: Bar charts, tooltips, legends
  - Real-time data updates
- Sonner for toast notifications
  - Purpose: User feedback and notifications
  - Features: Success/error states, custom styling

## Feature Management
- LaunchDarkly React SDK
  - Purpose: Feature flag management and A/B testing
  - Version: Latest stable release
  - Implementation: Client-side SDK

## Development Tools
- TypeScript for type safety
- ESLint for code quality
- npm for package management

## Architecture Decisions
1. Using LaunchDarkly React SDK instead of vanilla JS SDK
   - Rationale: Better React integration with hooks and components
   - Benefits: Automatic subscription handling and React-specific optimizations

2. Client-side Implementation
   - Rationale: Direct feature flag evaluation in the browser
   - Consideration: Ensures real-time flag updates without page refresh

3. shadcn-ui Implementation
   - Style: New York
   - Base Color: Neutral
   - Benefits: Consistent design system with customizable components

4. Data Visualization with Recharts
   - Rationale: Powerful, flexible charting library
   - Benefits: 
     - React-specific implementation
     - Responsive design
     - Customizable styling
     - Real-time updates support

5. Toast Notifications with Sonner
   - Rationale: Modern, lightweight toast system
   - Benefits:
     - Clean API
     - Customizable styling
     - Queue management
     - Accessibility support

## Dependencies
- @launchdarkly/react-client-sdk: Feature flag management
- Core React dependencies (pre-existing)
- TypeScript configuration (pre-existing)
- Tailwind CSS and related plugins
- shadcn-ui components (as needed)
- recharts: Data visualization library
- sonner: Toast notification system
- @radix-ui/react-icons: Icon system
