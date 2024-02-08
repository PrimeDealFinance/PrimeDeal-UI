'use client';
import * as React from 'react';
import { CssVarsProvider, extendTheme} from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import NextAppDirEmotionCacheProvider from './EmotionCache';

const theme = extendTheme({ cssVarPrefix: 'demo' });

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <NextAppDirEmotionCacheProvider options={{ key: 'joy' }}>
      <CssVarsProvider   
      defaultMode="dark"
      // the props below are specific to this demo,
      // you might not need them in your app.
      //
      theme={theme}
      // the selector to apply CSS theme variables stylesheet.
      colorSchemeSelector="#demo_dark-mode-by-default"
      //
      // the local storage key to use
      modeStorageKey="demo_dark-mode-by-default"
      //
      // set as root provider
      disableNestedContext
   >
        <CssBaseline />
        {children}
      </CssVarsProvider>
    </NextAppDirEmotionCacheProvider>
  );
}