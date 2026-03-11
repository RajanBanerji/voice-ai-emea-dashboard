import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { CredentialsProvider } from './context/CredentialsContext';
import { TestResultsProvider } from './context/TestResultsContext';
import { HistoryProvider } from './context/HistoryContext';
import { ThemeProvider } from './context/ThemeContext';
import { ModeProvider } from './context/ModeContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
    <ModeProvider>
      <CredentialsProvider>
        <TestResultsProvider>
          <HistoryProvider>
            <App />
          </HistoryProvider>
        </TestResultsProvider>
      </CredentialsProvider>
    </ModeProvider>
    </ThemeProvider>
  </StrictMode>,
);
