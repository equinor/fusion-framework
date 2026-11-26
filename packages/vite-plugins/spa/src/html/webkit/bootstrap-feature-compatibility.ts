import { supportsExplicitResourceManagement } from './supports-explicit-resource-management.js';

// Keep parser-sensitive code behind a dynamic import so unsupported browsers never parse it.
if (supportsExplicitResourceManagement()) {
  void import('./bootstrap-native.js');
} else {
  void import('./bootstrap-webkit-fallback.js');
}
