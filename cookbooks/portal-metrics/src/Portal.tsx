import { MetricTrigger } from './MetricTrigger';

export const Portal = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Metrics Module Cookbook</h1>
      <p>Demonstrates the metrics module functionality</p>
      {/*<MetricTrigger />*/}

      {/* Instructions for viewing metrics */}
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h3>How to View Metrics:</h3>
        <p>Open Prometheus: <a href="http://localhost:8889/metrics" target="_blank">http://localhost:8889/metrics</a></p>
        <p>Or view logs: <code>docker-compose logs -f otel-collector</code></p>
      </div>
    </div>
  );
};
