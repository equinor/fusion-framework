import { bootstrap } from '../bootstrap.js';
import { registerServiceWorkerNative } from './register-service-worker-native.js';

void bootstrap(registerServiceWorkerNative, async (measurement, run) => {
  using _measurementScope = measurement;
  await run();
});
