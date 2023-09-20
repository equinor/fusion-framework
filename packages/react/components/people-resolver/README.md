Component for providing resolver to person elements

mapping and caching of `@equinor/fusion-framework-module-services/people`

> Strongly collated to the Fusion ecosystems

```tsx
import { PeopleResolverProvider } from '@equinor/fusion-framework-react-components-people-provider';

<PeopleResolverProvider>
    <fwc-person-avatar azureId='cbc6480d-12c1-467e-b0b8-cfbb22612daa'></fwc-person-avatar>
    <fwc-person-card azureId='cbc6480d-12c1-467e-b0b8-cfbb22612daa'></fwc-person-card>
    <fwc-person-list-item azureId='cbc6480d-12c1-467e-b0b8-cfbb22612daa'></fwc-person-list-item>
</PeopleResolverProvider>
```

> we might in the future provide a module which provides same functionality as the resolver
>
> atm there are no flexible way to configure this provider since the api models are strongly collated to the models of the components
>
> if requested we can create a provider for the functionality

### Fallback image
```tsx
import { PeopleResolverProvider } from '@equinor/fusion-framework-react-components-people-provider';
import fallbackSvg from './resources/fallback-photo.svg';

const fallbackImage = new Blob([fallbackSvg], { type: 'image/svg+xml' });

const App = () => (
  <PeopleResolverProvider options={{fallbackImage}}>
    ...children
  </PeopleResolverProvider>
);
```