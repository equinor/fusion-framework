import { type Theme, themeAlpine, createTheme, createPart } from 'ag-grid-community';

export const fusionTheme: Theme = themeAlpine.withParams({
    fontFamily: 'Equinor, sans-serif',
    accentColor: '#00A2FF',
    backgroundColor: '#21222C',
    borderColor: '#429356',
    borderRadius: 0,
    browserColorScheme: 'dark',
    cellHorizontalPaddingScale: 0.8,
    cellTextColor: '#50F178',
    columnBorder: true,
    fontSize: 12,
    foregroundColor: '#68FF8E',
    headerBackgroundColor: '#21222C',
    headerFontSize: 14,
    headerFontWeight: 700,
    headerTextColor: '#68FF8E',
    headerVerticalPaddingScale: 1.5,
    oddRowBackgroundColor: '#21222C',
    rangeSelectionBackgroundColor: '#FFFF0020',
    rangeSelectionBorderColor: 'yellow',
    rangeSelectionBorderStyle: 'dashed',
    rowBorder: true,
    rowVerticalPaddingScale: 1.5,
    sidePanelBorder: true,
    spacing: 4,
    wrapperBorder: true,
    wrapperBorderRadius: 0,
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
