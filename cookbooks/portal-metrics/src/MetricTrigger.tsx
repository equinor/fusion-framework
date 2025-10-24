import { useFrameworkModule } from '@equinor/fusion-framework-react';

export const MetricTrigger = () => {
  const metrics = useFrameworkModule('metric');
  console.log(metrics);

  // const handleClick = async () => {
  //   if (!metrics) {
  //     console.warn('Metrics module not available');
  //     return;
  //   }

  //   // Register a simple metric event
  //   await metrics.registerMetric({
  //     name: 'button_click',
  //     timestamp: Date.now(),
  //     attributes: {
  //       source: 'cookbook',
  //       action: 'manual_trigger'
  //     }
  //   });

  //   console.log('Metric registered and sent to collector');
  // };


      // <button onClick={handleClick}>
  return (
    <div>
      <button type="submit">
        Register Metric
      </button>
      <p>Click to emit a metric event to the OpenTelemetry Collector</p>
    </div>
  );
};
