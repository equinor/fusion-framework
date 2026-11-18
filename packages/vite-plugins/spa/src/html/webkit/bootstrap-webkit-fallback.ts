import { bootstrap } from '../bootstrap.js';
import { registerServiceWorker } from '../register-service-worker.js';
import { runWithCompatibilityScope } from './run-with-compatibility-scope.js';

void bootstrap(registerServiceWorker, runWithCompatibilityScope);
