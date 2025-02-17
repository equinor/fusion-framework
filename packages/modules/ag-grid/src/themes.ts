import { type Theme, themeAlpine, createTheme, createPart } from 'ag-grid-community';

export const fusionTheme: Theme = themeAlpine.withParams({
    fontFamily: 'Equinor, sans-serif',
});

export const createThemeFromTheme = (theme: Theme): Theme => {
    const newTheme = createTheme();
    if ('parts' in theme && Array.isArray(theme.parts)) {
        for (const part of theme.parts) {
            newTheme.withPart(createPart(part));
        }
    }
    return newTheme;
};

export { createTheme, type Theme };

export default { fusionTheme };
