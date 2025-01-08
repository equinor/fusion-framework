import { type Theme, themeAlpine, createTheme } from './community';

export const fusionTheme: Theme = themeAlpine.withParams({
    fontFamily: 'Equinor, sans-serif',
});

export { createTheme, type Theme };

export default { fusionTheme };
