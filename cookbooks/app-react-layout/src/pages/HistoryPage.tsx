import type { ReactElement } from 'react';
import { Typography } from '@equinor/eds-core-react';
import { Page } from '@equinor/fusion-react-layout';
import { AgGridReact } from '@equinor/fusion-framework-react-ag-grid';
import type { ColDef } from '@equinor/fusion-framework-react-ag-grid/community';
import styled from 'styled-components';

interface Episode {
  episode: string;
  title: string;
  airDate: string;
  destination: string;
  status: string;
}

const episodes: Episode[] = [
  {
    episode: 'S01E01',
    title: 'Pilot',
    airDate: 'Dec 2, 2013',
    destination: 'Dimension 35-C',
    status: 'Portal seeds recovered',
  },
  {
    episode: 'S01E02',
    title: 'Lawnmower Dog',
    airDate: 'Dec 9, 2013',
    destination: 'Snuffles dreamscape',
    status: 'Dogs relocated peacefully',
  },
  {
    episode: 'S01E03',
    title: 'Anatomy Park',
    airDate: 'Dec 16, 2013',
    destination: 'Ruben inner dimension',
    status: 'Park permanently closed',
  },
  {
    episode: 'S01E04',
    title: 'M. Night Shaym-Aliens!',
    airDate: 'Jan 13, 2014',
    destination: 'Zigerion simulation',
    status: 'Recipe integrity compromised',
  },
  {
    episode: 'S01E05',
    title: 'Meeseeks and Destroy',
    airDate: 'Jan 20, 2014',
    destination: 'Giant courthouse',
    status: 'Golf lesson escalated',
  },
  {
    episode: 'S01E06',
    title: 'Rick Potion #9',
    airDate: 'Jan 27, 2014',
    destination: 'Replacement dimension',
    status: 'Timeline abandoned',
  },
  {
    episode: 'S01E07',
    title: 'Raising Gazorpazorp',
    airDate: 'Mar 10, 2014',
    destination: 'Gazorpazorp',
    status: 'Parenting remains difficult',
  },
  {
    episode: 'S01E08',
    title: 'Rixty Minutes',
    airDate: 'Mar 17, 2014',
    destination: 'Interdimensional cable',
    status: 'Infinite channels scanned',
  },
  {
    episode: 'S01E09',
    title: 'Something Ricked This Way Comes',
    airDate: 'Mar 24, 2014',
    destination: 'The Devil’s antique shop',
    status: 'Curses professionally removed',
  },
  {
    episode: 'S01E10',
    title: 'Close Rick-counters of the Rick Kind',
    airDate: 'Apr 7, 2014',
    destination: 'The Citadel',
    status: 'Council paperwork filed',
  },
  {
    episode: 'S01E11',
    title: 'Ricksy Business',
    airDate: 'Apr 14, 2014',
    destination: 'Abradolf Lincler party',
    status: 'House mostly restored',
  },
  {
    episode: 'S02E02',
    title: 'Mortynight Run',
    airDate: 'Aug 2, 2015',
    destination: 'Blips and Chitz',
    status: 'Roy high score disputed',
  },
  {
    episode: 'S02E04',
    title: 'Total Rickall',
    airDate: 'Aug 16, 2015',
    destination: 'Smith residence',
    status: 'Parasites eliminated',
  },
  {
    episode: 'S03E03',
    title: 'Pickle Rick',
    airDate: 'Aug 6, 2017',
    destination: 'Sewer compound',
    status: 'Therapy narrowly avoided',
  },
  {
    episode: 'S03E07',
    title: 'The Ricklantis Mixup',
    airDate: 'Sep 10, 2017',
    destination: 'The Citadel',
    status: 'Election results concerning',
  },
];

const columnDefs: ColDef<Episode>[] = [
  { field: 'episode', headerName: 'Episode', maxWidth: 120 },
  { field: 'title', headerName: 'Title', minWidth: 240 },
  { field: 'airDate', headerName: 'Air date', minWidth: 150 },
  { field: 'destination', headerName: 'Destination', minWidth: 220 },
  { field: 'status', headerName: 'Mission status', minWidth: 220 },
];

const defaultColDef: ColDef<Episode> = {
  flex: 1,
  minWidth: 120,
  filter: true,
  resizable: true,
  sortable: true,
};

const Styled = {
  Grid: styled.div`
    width: 100%;
    height: min(65vh, 700px);
    min-height: 420px;
  `,
  Wrapper: styled.div`
    padding: 0 0 0 2rem;
  `,
};

/** Renders navigation history content for the layout cookbook. */
export const HistoryPage = (): ReactElement => (
  <Page>
    <Page.Header>
      <Styled.Wrapper>
        <Typography group="heading" variant="h1">
          Portal history
        </Typography>
      </Styled.Wrapper>
    </Page.Header>
    <Page.Main>
      <Styled.Wrapper>
        <Typography group="heading" variant="h2">
          Recent interdimensional trips
        </Typography>
        <Typography group="paragraph" variant="body_long">
          Morty recovered the episode log before Rick could clear the portal history.
        </Typography>
        <Styled.Grid>
          <AgGridReact<Episode>
            rowData={episodes}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20]}
          />
        </Styled.Grid>
      </Styled.Wrapper>
    </Page.Main>
  </Page>
);
