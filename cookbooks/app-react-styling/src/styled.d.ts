import 'styled-components';
import type { FusionTheme } from '@equinor/fusion-react-styles';

declare module 'styled-components' {
  export interface DefaultTheme extends FusionTheme {}
}
