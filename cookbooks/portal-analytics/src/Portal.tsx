import { Header } from './Header';
import { LogReader } from './LogReader';

export const Portal = () => {
  return (
    <>
      <Header />
      <div style={{ padding: '20px' }}>
        <h1>Analytics Module Cookbook</h1>
        <p>Demonstrates the analytics module functionality</p>

        <p>Click to emit a analytic event to the OpenTelemetry Collector</p>

        {/* biome-ignore lint/correctness/useUniqueElementIds: we need the static id */}
        <button type="button" id="button-trigger">
          Trigger click event
        </button>

        <p>
          Or select a context in the context-selector above. This should emit an event to the
          OpenTelemetry Collector
        </p>

        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
          <h3>View Analytics:</h3>
          <p>Newest on top</p>
          <LogReader />
        </div>
      </div>
    </>
  );
};
