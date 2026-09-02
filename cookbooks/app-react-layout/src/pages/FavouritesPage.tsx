import type { ReactElement } from 'react';
import { Page } from '@equinor/fusion-react-layout';
import { Styled } from '../styled';

/** Renders saved destinations for the layout cookbook. */
export const FavouritesPage = (): ReactElement => (
  <Page>
    <Page.Header>
      <Styled.Wrapper>
        <h1>Favourite dimensions</h1>
      </Styled.Wrapper>
    </Page.Header>
    <Page.Main>
      <Styled.Wrapper>
        <h2>Destinations worth another portal</h2>
        <ul>
          <li>C-137, mostly because the garage Wi-Fi reconnects automatically.</li>
          <li>The dimension where every deployment passes on the first attempt.</li>
          <li>Birdperson&apos;s home world, which has excellent spacing and typography.</li>
          <li>The universe where Jerry understands semantic versioning.</li>
        </ul>
      </Styled.Wrapper>
    </Page.Main>
  </Page>
);
