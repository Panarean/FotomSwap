import { foundations } from './foundations';
import { components } from './components';
import { ThemeConfig } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/react';
export const theme = extendTheme({
    components,
    ...foundations,
    config: {
        useSystemColorMode: true,
        initialColorMode: 'dark',
        cssVarPrefix: 'picker',
    } as ThemeConfig,
});
