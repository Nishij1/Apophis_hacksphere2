import { DefaultTheme } from 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      background: string;
      text: string;
      border: string;
      primary: string;
    };
  }
}

export const lightTheme: DefaultTheme = {
  colors: {
    background: '#ffffff',
    text: '#000000',
    border: '#e5e5e5',
    primary: '#3b82f6',
  },
};

export const darkTheme: DefaultTheme = {
  colors: {
    background: '#1a1a1a',
    text: '#ffffff',
    border: '#333333',
    primary: '#3b82f6',
  },
}; 