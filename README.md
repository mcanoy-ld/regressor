# Regression Tester

This Vite project will simulate events within the LaunchDarkly. It uses 2 primary metrics - 

`flight-status-latency` - Numeric metric to track the latency of the flight status response+

`flight-status-error` - Conversion metric to track the error rate of the flight status response

It has a toggle that enables "extreme mode" in it which will ramp up the latency and error rates to higher values, to drive a regression up. 

It also has a slider to adjust the timing of interval of the test. By default it runs 1000 test runs at 500ms intervals. 

The client side key is located in `src/main.tsx` and can be changed if needed. The code is also commented out to switch into staging for pre-production runs as needed. 

It's also pre-wired for error monitoring and session replay. 