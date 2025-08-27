import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // For React projects

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/main.tsx',
      fileName: 'main',
      formats: ['es'],
    },
    outDir: 'dist', // Output directory for production builds
    emptyOutDir: true, // Clean output directory before building
  },
});
