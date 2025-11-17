import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './src/store/store';
import { AuthProvider } from './src/auth/AuthContext';
import Navigation from './src/navigation/Navigation';

export default function App() {
  return (
    <ReduxProvider store={store}>
      <AuthProvider>
        <SafeAreaProvider>
          <Navigation />
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </AuthProvider>
    </ReduxProvider>
  );
}