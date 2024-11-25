import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk'
import { Button } from "./components/ui/button"
import { useEffect, useState } from 'react'
import { Toaster, toast } from 'sonner'
import { TestResultsChart } from './components/TestResultsChart'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./components/ui/card"
import { Switch } from "./components/ui/switch"
import { Slider } from "./components/ui/slider"
import { Progress } from "./components/ui/progress"
import { ThemeProvider } from "./components/theme-provider"
import { GearIcon } from "@radix-ui/react-icons"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "./components/ui/dialog"
import { Label } from "./components/ui/label"
import { Input } from "./components/ui/input"

function App() {
  const { flightStatus } = useFlags()
  const client = useLDClient()
  const [isRunning, setIsRunning] = useState(false)
  const [trueCount, setTrueCount] = useState(0)
  const [falseCount, setFalseCount] = useState(0)
  const [errors, setErrors] = useState(0)
  const [averageLatency, setAverageLatency] = useState(0)
  const [totalLatency, setTotalLatency] = useState(0)
  const [extremeMode, setExtremeMode] = useState(false)
  const [testInterval, setTestInterval] = useState(500)
  const [errorCount, setErrorCount] = useState(0)
  const [extremeModeLatencyMin, setExtremeModeLatencyMin] = useState(110)
  const [extremeModeLatencyMax, setExtremeModeLatencyMax] = useState(120)
  const [extremeModeErrorRate, setExtremeModeErrorRate] = useState(95)
  const [clientSideId, setClientSideId] = useState(() => localStorage.getItem('userIdPrefix') || 'user')
  const [latencyMetricKey, setLatencyMetricKey] = useState(() => localStorage.getItem('latencyMetricKey') || 'flight-status-latency')
  const [errorMetricKey, setErrorMetricKey] = useState(() => localStorage.getItem('errorMetricKey') || 'Flight Status Error')
  const [showSettings, setShowSettings] = useState(false)
  const [ldClientSideId, setLdClientSideId] = useState(() => localStorage.getItem('clientSideID') || '650e1ecc844ace12c3e99023')

  // Show toast when flightStatus is true (Version B)
  useEffect(() => {
    if (flightStatus) {
      toast.success('Feature flag evaluated to true', {
        description: 'Running Version B of the test'
      })
    }
  }, [flightStatus])

  // Save clientSideID to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('clientSideID', ldClientSideId)
    // Show toast to notify user they need to refresh
    if (ldClientSideId !== localStorage.getItem('clientSideID')) {
      toast.info('Client Side ID Updated', {
        description: 'Please refresh the page for changes to take effect'
      })
    }
  }, [ldClientSideId])

  // Function to generate random user key
  const generateRandomUser = () => {
    return `${clientSideId}-${Math.random().toString(36).substring(2, 6)}`
  }

  // Function to simulate latency (110-130ms range, or custom range in extreme mode)
  const simulateLatency = () => {
    if (extremeMode && flightStatus) {
      // Use custom latency range for extreme mode
      return Math.floor(Math.random() * (extremeModeLatencyMax - extremeModeLatencyMin + 1)) + extremeModeLatencyMin
    }
    // Normal latency range
    const minLatency = 110
    const maxLatency = 130
    return Math.floor(Math.random() * (maxLatency - minLatency + 1)) + minLatency
  }

  // Function to create a delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Function to determine if an error should occur based on version and mode
  const shouldSimulateError = (isFlightStatusTrue: boolean) => {
    setErrorCount(prev => prev + 1)
    
    if (extremeMode && isFlightStatusTrue) {
      // In extreme mode with flightStatus true:
      // Return true (error) based on custom error rate
      return Math.random() * 100 < extremeModeErrorRate
    }
    
    // In all other cases:
    // Return true (error) for 5% of calls
    return Math.random() * 100 < 5
  }

  // Function to run a single test iteration
  const runTestIteration = async () => {
    if (!client) return

    const artificialLatency = simulateLatency()
    const newUser = {
      key: generateRandomUser(),
    }

    try {
      // Update client context
      await client.identify(newUser)

      // Determine if we should simulate an error
      const shouldError = shouldSimulateError(flightStatus)
      
      // Simulate the artificial latency first
      await delay(artificialLatency)

      // Track latency metric for all cases
      await client.track(latencyMetricKey, {
        key: latencyMetricKey,
        data: {
          variant: flightStatus ? 'B' : 'A',
          timestamp: new Date().toISOString(),
          latencyMs: artificialLatency,
          isExtremeMode: extremeMode
        }
      }, artificialLatency)

      // Update average latency using only the artificial latency
      const totalTests = trueCount + falseCount
      setTotalLatency(prev => prev + artificialLatency)
      setAverageLatency(Math.round((totalLatency + artificialLatency) / (totalTests + 1)))

      // Check for error BEFORE success operations
      if (shouldError) {
        throw new Error('Simulated test error')
      }

      // Only increment counters and show success toast if no error
      if (flightStatus) {
        setTrueCount(prev => prev + 1)
      } else {
        setFalseCount(prev => prev + 1)
      }

      toast.success(`Test ${totalTests + 1} completed successfully`, {
        description: `User: ${newUser.key} - Variant: ${flightStatus ? 'B' : 'A'}`
      })
    
    } catch (error) {
      // Increment error counter
      setErrors(prev => prev + 1)
      
      // Still increment counters even on error
      if (flightStatus) {
        setTrueCount(prev => prev + 1)
      } else {
        setFalseCount(prev => prev + 1)
      }

      // Show error toast
      toast.error(`Test ${trueCount + falseCount + 1} failed`, {
        description: `${error instanceof Error ? error.message : 'Unknown error'} - Variant: ${flightStatus ? 'B' : 'A'}`
      })

      // Track error metric
      await client.track(errorMetricKey, {
        key: errorMetricKey,
        data: {
          variant: flightStatus ? 'B' : 'A',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error',
          isExtremeMode: extremeMode
        }
      })
    }

    // Ensure all events are flushed before completing the iteration
    await client.flush()
  }

  // Main testing loop
  useEffect(() => {
    let isCancelled = false

    const runTests = async () => {
      while (!isCancelled && isRunning && (trueCount + falseCount) < 1000) {
        await runTestIteration()
      }
      
      if (trueCount + falseCount >= 1000) {
        setIsRunning(false)
        toast.success('Testing completed!', {
          description: `Completed 1000 tests with ${errors} errors`
        })
      }
    }

    const startTests = async () => {
      if (isRunning) {
        await delay(testInterval)
        await runTests()
      }
    }

    startTests()

    return () => {
      isCancelled = true
    }
  }, [isRunning, trueCount, falseCount, testInterval, client, flightStatus, errors])

  const handleStartStop = () => {
    if (!isRunning) {
      setTrueCount(0)
      setFalseCount(0)
      setErrors(0)
      setTotalLatency(0)
      setAverageLatency(0)
      setErrorCount(0)
    }
    setIsRunning(!isRunning)
  }

  // Function to get current error rate text
  const getErrorRateText = () => {
    if (extremeMode && flightStatus) {
      return `${extremeModeErrorRate}% (Version B - flightStatus true - Extreme)`
    }
    return '5% (Standard error rate)'
  }

  // Function to throw a test error
  const throwTestError = () => {
    throw new Error('Manual test error triggered')
  }

  const handleSaveSettings = () => {
    // Save all settings
    localStorage.setItem('clientSideID', ldClientSideId)
    localStorage.setItem('userIdPrefix', clientSideId)
    localStorage.setItem('latencyMetricKey', latencyMetricKey)
    localStorage.setItem('errorMetricKey', errorMetricKey)
    
    setShowSettings(false)
    
    // Show toast and reload after a brief delay
    toast.success('Settings saved', {
      description: 'Reloading page to apply changes...'
    })
    
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
      <div className="min-h-screen bg-background p-4 md:p-6">
      
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">LaunchDarkly Regression Test Runner</h1>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <GearIcon className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configuration Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ldClientId">LaunchDarkly Client ID</Label>
                    <Input
                      id="ldClientId"
                      value={ldClientSideId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLdClientSideId(e.target.value)}
                      placeholder="Enter LaunchDarkly Client ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientId">User ID Prefix</Label>
                    <Input
                      id="clientId"
                      value={clientSideId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setClientSideId(e.target.value)}
                      placeholder="Enter client ID prefix"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="latencyKey">Latency Metric Event Key</Label>
                    <Input
                      id="latencyKey"
                      value={latencyMetricKey}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLatencyMetricKey(e.target.value)}
                      placeholder="Enter latency metric key"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="errorKey">Error Metric Event Key</Label>
                    <Input
                      id="errorKey"
                      value={errorMetricKey}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setErrorMetricKey(e.target.value)}
                      placeholder="Enter error metric key"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSettings(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveSettings}>
                    Save & Reload
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              variant={isRunning ? "destructive" : "default"}
              onClick={handleStartStop}
              className="w-full sm:w-40"
            >
              {isRunning ? 'Stop Testing' : 'Start Testing'}
            </Button>
          </div>
        </div>

       
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         
          <div className="lg:col-span-4 space-y-6">
          
            <Card>
              <CardHeader>
                <CardTitle>Test Mode</CardTitle>
                <CardDescription>Toggle between normal and extreme testing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-base font-medium">Extreme Mode</label>
                    <p className="text-sm text-muted-foreground">
                      {extremeMode ? 'Advanced testing enabled' : 'Standard testing mode'}
                    </p>
                  </div>
                  <Switch
                    checked={extremeMode}
                    onCheckedChange={setExtremeMode}
                    disabled={isRunning}
                  />
                </div>
              </CardContent>
            </Card>

          
            <Card>
              <CardHeader>
                <CardTitle>Test Interval</CardTitle>
                <CardDescription>Adjust time between test iterations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">{testInterval}ms</span>
                  <span className="text-sm text-muted-foreground">
                    {testInterval < 500 ? 'Fast' : testInterval < 1000 ? 'Medium' : 'Slow'}
                  </span>
                </div>
                <Slider
                  min={100}
                  max={2000}
                  step={100}
                  value={[testInterval]}
                  onValueChange={([value]) => setTestInterval(value)}
                  disabled={isRunning}
                />
              </CardContent>
            </Card>

            {extremeMode && (
              <Card>
                <CardHeader>
                  <CardTitle>Extreme Mode Settings</CardTitle>
                  <CardDescription>Configure advanced test parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Min Latency</span>
                        <span className="text-sm text-muted-foreground">{extremeModeLatencyMin}ms</span>
                      </div>
                      <Slider
                        min={50}
                        max={500}
                        value={[extremeModeLatencyMin]}
                        onValueChange={([value]) => setExtremeModeLatencyMin(value)}
                        disabled={isRunning}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Max Latency</span>
                        <span className="text-sm text-muted-foreground">{extremeModeLatencyMax}ms</span>
                      </div>
                      <Slider
                        min={50}
                        max={500}
                        value={[extremeModeLatencyMax]}
                        onValueChange={([value]) => setExtremeModeLatencyMax(value)}
                        disabled={isRunning}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Error Rate</span>
                        <span className="text-sm text-muted-foreground">{extremeModeErrorRate}%</span>
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        value={[extremeModeErrorRate]}
                        onValueChange={([value]) => setExtremeModeErrorRate(value)}
                        disabled={isRunning}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-8 space-y-6">

            <Card className="h-[400px] md:h-[500px]">
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Test Results Distribution</CardTitle>
                    <CardDescription>Live view of feature flag evaluations</CardDescription>
                  </div>
                  <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <div className="text-right">
                      <div className="text-2xl font-bold">{trueCount + falseCount}</div>
                      <p className="text-sm text-muted-foreground">Total Tests</p>
                    </div>
                    <Progress 
                      value={((trueCount + falseCount) / 1000) * 100} 
                      className="w-full sm:w-40"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[300px] md:h-[400px]">
                <TestResultsChart
                  trueCount={trueCount}
                  falseCount={falseCount}
                />
              </CardContent>
            </Card>

          
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {trueCount + falseCount === 0 ? '0.0%' : 
                      ((errors / (trueCount + falseCount)) * 100).toFixed(1) + '%'}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {errors} total errors
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Latency</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(averageLatency)}ms
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Target: {extremeMode ? `${extremeModeLatencyMin}-${extremeModeLatencyMax}ms` : '110-130ms'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {flightStatus ? 'Version B' : 'Version A'}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {extremeMode ? 'Extreme Mode' : 'Normal Mode'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

 
        <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6">
          <Button
            variant="outline"
            size="sm"
            onClick={throwTestError}
            className="bg-background"
          >
            <GearIcon className="h-4 w-4 mr-2" />
            Throw Test Error
          </Button>
        </div>

 
        <Toaster 
          position="bottom-right" 
          className="bottom-4 right-4 md:bottom-6 md:right-6"
        />
      </div>
    </ThemeProvider>
  )
}

export default App
