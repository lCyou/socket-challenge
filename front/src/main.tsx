import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Container from './providers/routerProvider.tsx';
import { UserProvider } from './providers/UserProvider.tsx';

// アプリケーションのテーマを定義
const theme = createTheme({
  palette: {
    primary: {
      main: '#1b5e20',
      
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* MUIのCSSリセット */}
      <UserProvider>
        <Container />
      </UserProvider>
    </ThemeProvider>
  </StrictMode>,
);
