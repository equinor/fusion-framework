import type { ReactElement } from 'react';
import { List, Typography } from '@equinor/eds-core-react';
import { Page } from '@equinor/fusion-react-layout';
import { Styled } from '../styled';

/** Renders saved destinations for the layout cookbook. */
export const FavouritesPage = (): ReactElement => (
  <Page>
    <Page.Header>
      <Styled.Wrapper>
        <Typography group="heading" variant="h1">
          Favourite dimensions
        </Typography>
      </Styled.Wrapper>
    </Page.Header>
    <Page.Main>
      <Styled.Wrapper>
        <Typography group="heading" variant="h2">
          Destinations worth another portal
        </Typography>
        <List>
          <List.Item>C-137, mostly because the garage Wi-Fi reconnects automatically.</List.Item>
          <List.Item>The dimension where every deployment passes on the first attempt.</List.Item>
          <List.Item>
            Birdperson&apos;s home world, which has excellent spacing and typography.
          </List.Item>
          <List.Item>The universe where Jerry understands semantic versioning.</List.Item>
        </List>
      </Styled.Wrapper>
    </Page.Main>
  </Page>
);
