import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lakbay.app',
  appName: 'Lakbay',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
