# Regression Tester

This Vite project will simulate events within the LaunchDarkly, and can be used to test Guardian Editions regression detection.

## QuickStart 

This project is based in Vite so you'll need to have the proper versions of node setup to run it

* Install and configure homebrew (on MacOS)
* `brew install nvm` 
* `nvm install 20` 
* run `npm run dev` 
* Access the application at http://localhost:5173
* Configure your client side key and metric names in the settings screen 
* Select "Start Testing" on the top right corner

For ease, you might consider running it in Vercel or Railway

## Metric Configuration 

By default it uses 2 metrics - 

`flight-status-latency` - Numeric metric to track the latency of the flight status response+

`Flight Status Error` - Conversion metric to track the error rate of the flight status response

These metrics can be changed within the settings screen, along with the `clientSideID` for your project. 

## Regression Testing

It has a toggle that enables "extreme mode" in it which will ramp up the latency and error rates to higher values, to drive a regression up. 

It also has a slider to adjust the timing of interval of the test. By default it runs 1000 test runs at 500ms intervals. 

## Error Monitoring / Session Replay 

It's also pre-wired for error monitoring and session replay. These configurations are in the `src/main.tsx` file. 