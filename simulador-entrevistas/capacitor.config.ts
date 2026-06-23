import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'simulador-entrevistas',
  webDir: 'out', // Asegúrate de que diga 'out'
  server: {
    androidScheme: 'https'
  }
};

export default config;
