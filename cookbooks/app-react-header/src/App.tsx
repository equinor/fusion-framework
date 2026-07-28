import { Button, Typography } from '@equinor/eds-core-react';
import { SideSheet } from '@equinor/fusion-react-side-sheet';
import { type ReactElement, useState } from 'react';
import { styled } from 'styled-components';

const Styled = {
  Root: styled.main`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--eds-spacing-vertical-lg);
    color: var(--eds-color-text-strong);
    background: var(--eds-color-bg-canvas);
  `,
  StickyContent: styled.section`
    position: sticky;
    inset-block-start: 0;
    z-index: 1;
    inline-size: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--eds-spacing-vertical-xs);
    padding-block: var(--eds-spacing-vertical-sm);
    padding-inline: var(--eds-spacing-horizontal-md);
    border: 1px solid var(--eds-color-border-accent-medium);
    border-radius: var(--eds-shape-corners-border-radius);
    background: var(--eds-color-bg-accent-surface);
  `,
  Content: styled.div`
    position: relative;
    isolation: isolate;
    display: flex;
    flex-direction: column;
    gap: var(--eds-spacing-vertical-lg);
    padding-block-end: 500px;
  `,
  Introduction: styled.section`
    display: flex;
    flex-direction: column;
    gap: var(--eds-spacing-vertical-xs);
  `,
  StackingSection: styled.section`
    display: flex;
    flex-direction: column;
    gap: var(--eds-spacing-vertical-sm);
  `,
  StackingCanvas: styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--eds-spacing-vertical-sm);
    padding-block: var(--eds-spacing-vertical-md);
    padding-inline: var(--eds-spacing-horizontal-md);
    border: 1px solid var(--eds-color-border-subtle);
    border-radius: var(--eds-shape-corners-border-radius);
    background: var(--eds-color-bg-surface);

    > div {
      position: relative;
      min-block-size: calc(var(--eds-spacing-vertical-3xl) * 3);
      display: flex;
      align-items: center;
      padding-inline: var(--eds-spacing-horizontal-md);
      border: 1px solid var(--eds-color-border-medium);
      border-radius: var(--eds-shape-corners-border-radius);
    }

    > div:nth-of-type(1) {
      z-index: 0;
      background: var(--eds-color-bg-info-surface);
    }

    > div:nth-of-type(2) {
      z-index: 1;
      background: var(--eds-color-bg-success-surface);
    }

    > div:nth-of-type(3) {
      z-index: 2;
      background: var(--eds-color-bg-warning-surface);
    }

    > div:nth-of-type(4) {
      z-index: 3;
      background: var(--eds-color-bg-accent-surface);
    }

    > div:nth-of-type(5) {
      z-index: 10;
      background: var(--eds-color-bg-info-surface);
    }

    > div:nth-of-type(6) {
      z-index: 100;
      background: var(--eds-color-bg-success-surface);
    }

    > div:nth-of-type(7) {
      z-index: 1000;
      background: var(--eds-color-bg-warning-surface);
    }

    > div:nth-of-type(8) {
      z-index: 10000;
      background: var(--eds-color-bg-accent-surface);
    }

    > div:nth-of-type(9) {
      z-index: 100000;
      background: var(--eds-color-bg-info-surface);
    }

    > div:nth-of-type(10) {
      z-index: 500000;
      background: var(--eds-color-bg-success-surface);
    }

    > div:nth-of-type(11) {
      z-index: 999999;
      background: var(--eds-color-bg-danger-surface);
    }
  `,
};

/**
 * Renders observable state and manual checks for the dev portal Header component.
 *
 * The surrounding dev portal renders the Header itself. This app enables its context
 * selector and bookmark action for visual verification.
 *
 * @returns The Header component test harness.
 *
 * @example
 * Run `pnpm --filter @equinor/fusion-framework-cookbook-app-react-header dev`
 * and interact with the top bar.
 */
export const App = (): ReactElement => {
  const [isSideSheetOpen, setIsSideSheetOpen] = useState(false);

  return (
    <>
      <Styled.Root>
        <Styled.StickyContent>
          <Typography variant="h3">Sticky app content</Typography>
          <Typography variant="body_short">
            This content stays below the portal top row while scrolling. The context selector
            dropdown should appear above it, while z-index test layers stay below it.
          </Typography>
          <Button variant="contained" onClick={() => setIsSideSheetOpen(true)}>
            Open side sheet
          </Button>
        </Styled.StickyContent>

        <Styled.Content>
          <Styled.Introduction>
            <Typography variant="h2">Dev portal Header test</Typography>
            <Typography variant="body_long">
              Use the top bar above this cookbook to verify context selection and stacking behavior.
            </Typography>
          </Styled.Introduction>

          <Styled.StackingSection>
            <Typography variant="h3">Vertical z-index scrolling test</Typography>
            <Typography variant="body_long">
              These normal-flow elements verify that z-index values from 0 through 3 do not affect
              scrolling or escape above the dev portal Header. The z-index 999999 layer stress-tests
              the same boundary.
            </Typography>
            <Styled.StackingCanvas aria-label="Vertical z-index test elements">
              <div>
                <Typography variant="h4">z-index: 0</Typography>
              </div>
              <div>
                <Typography variant="h4">z-index: 1</Typography>
              </div>
              <div>
                <Typography variant="h4">z-index: 2</Typography>
              </div>
              <div>
                <Typography variant="h4">z-index: 3</Typography>
              </div>
              <div>
                <Typography variant="h4">z-index: 10</Typography>
              </div>
              <div>
                <Typography variant="h4">z-index: 100</Typography>
              </div>
              <div>
                <Typography variant="h4">z-index: 1000</Typography>
              </div>
              <div>
                <Typography variant="h4">z-index: 10000</Typography>
              </div>
              <div>
                <Typography variant="h4">z-index: 100000</Typography>
              </div>
              <div>
                <Typography variant="h4">z-index: 500000</Typography>
              </div>
              <div>
                <Typography variant="h4">z-index: 999999</Typography>
              </div>
            </Styled.StackingCanvas>
          </Styled.StackingSection>
        </Styled.Content>
      </Styled.Root>

      <SideSheet
        isOpen={isSideSheetOpen}
        onClose={() => setIsSideSheetOpen(false)}
        isDismissable={true}
      >
        <SideSheet.Title title="Stacking test side sheet" />
        <SideSheet.Content>
          <Typography variant="body_long">
            This side sheet is rendered outside the isolated app content and should appear above the
            portal Header and every z-index test row.
          </Typography>
        </SideSheet.Content>
      </SideSheet>
    </>
  );
};

export default App;
