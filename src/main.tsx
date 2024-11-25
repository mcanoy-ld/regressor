import { createRoot } from "react-dom/client";
import {
  asyncWithLDProvider,
  useLDClient,
} from "launchdarkly-react-client-sdk";
import "./index.css";
import App from "./App.tsx";
import {
  initializeTelemetry,
  SessionReplay,
} from "@launchdarkly/browser-telemetry";
import { useEffect } from "react";

// Function to generate random user key
function generateRandomUser() {
  return `user-${Math.random().toString(36).substring(2, 15)}`;
}

async function init() {
  const session = new SessionReplay();
  const telemetry = initializeTelemetry({ collectors: [session] });

  const TelemetryWrapper = ({ children }: { children: React.ReactNode }) => {
    const client = useLDClient();

    useEffect(() => {
      if (client && telemetry) {
        telemetry.register(client);
      }
    }, [client]);

    return <>{children}</>;
  };

  // Get clientSideID from localStorage or use default
  const storedClientSideID = localStorage.getItem('clientSideID') || '650e1ecc844ace12c3e99023';

  const LDProvider = await asyncWithLDProvider({
    // clientSideID: '672ddc5691334a0855311cd6',
    clientSideID: storedClientSideID,
    // clientSideID: "6719dac7e8659a07fb1ef8d7",
    user: {
      key: generateRandomUser(),
      anonymous: true,
    },
    options: {
      application: {
        id: "regression-test-runner",
        version: "72c989d789d0835127e2c61dde582cc70ce15b75",
      },
      inspectors: telemetry.inspectors(),
      bootstrap: "localStorage",
      // baseUrl: "https://ld-stg.launchdarkly.com",
      // streamUrl: "https://clientstream-stg.launchdarkly.com",
      // eventsUrl: "https://events-stg.launchdarkly.com",
    },
  });

  createRoot(document.getElementById("root")!).render(
    <LDProvider>
      <TelemetryWrapper>
        <App />
      </TelemetryWrapper>
    </LDProvider>
  );
}

init();
