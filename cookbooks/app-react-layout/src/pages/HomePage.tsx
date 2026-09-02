import type { ReactElement } from 'react';
import { List, Typography } from '@equinor/eds-core-react';
import { Page } from '@equinor/fusion-react-layout';
import { Styled } from '../styled';

/** Renders the long-form landing page for the layout cookbook. */
export const HomePage = (): ReactElement => {
  return (
    <Page>
      <Page.Header>
        <Styled.Wrapper>
          <Typography group="heading" variant="h1">
            App React Layout
          </Typography>
        </Styled.Wrapper>
      </Page.Header>
      <Page.Main>
        <Styled.Wrapper>
          <Typography group="heading" variant="h2">
            Welcome to the App React Layout cookbook, where every panel stays in its own dimension
            and no portal gun is required.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            The sidebar is more dependable than Rick&apos;s inventions, while the main content has
            enough room for even Morty&apos;s most anxious status updates.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            Resize the page, explore the layout, and try not to turn the footer into a sentient
            butter-passing robot. It already has enough responsibilities.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            Somewhere in dimension C-137, Rick is insisting that responsive design is just regular
            design with extra steps. Morty is quietly checking the mobile breakpoint because
            experience has taught him not to trust that explanation.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            Every section has a designated place, unlike the contents of Rick&apos;s garage. The
            header announces where you are, the sidebar keeps navigation close, and the main area
            contains whatever experiment survived code review.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            If this paragraph suddenly develops self-awareness, remain calm. Close the tab, clear
            the cache, and under no circumstances accept its offer to improve production performance
            by replacing the team with Meeseeks.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            Morty asked whether the layout could handle a lot of content. Rick opened a portal to
            the bottom of the page and called that infinite scrolling. We chose ordinary browser
            scrolling because it is easier to debug and considerably less radioactive.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            The Council of Ricks reviewed these margins and declared them adequate across the
            Central Finite Curve. One unusually opinionated Rick requested two more pixels, but his
            pull request was closed after the tests failed in three dimensions.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            Summer prefers the sidebar because it gets directly to the point. Jerry prefers the
            footer because reaching it feels like an achievement. Beth has correctly observed that
            neither opinion should block the release.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            This content remains safely inside the page structure even when the viewport gets
            narrow. No portal technology, microverse battery, or suspiciously clever CSS trick is
            needed to keep the reading order intact.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            A plumbus would probably make the interface more versatile, but nobody can explain what
            its component API should look like. Until the specification arrives, semantic paragraphs
            will have to carry the workload.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            Birdperson once said that in responsive design, a breakpoint is the moment when a layout
            reveals its true character. He may have been talking about friendship, but the sentence
            also looks convincing in a frontend cookbook.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            By now the page should have enough vertical mileage for a proper scroll test. The
            scrollbar is not a glitch, a simulation, or evidence that squirrels control the browser.
            It simply means the content is taller than the available space.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            At the end of this interdimensional tour, everything returns to a familiar layout:
            navigation on the side, content in the middle, and a footer patiently waiting below.
            Clean, predictable, and only slightly more stable than Rick&apos;s portal fluid.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            Rick immediately objected to the phrase &quot;at the end.&quot; According to him,
            endings are a primitive browser concept invented by developers who have never nested one
            universe inside another. Morty suggested adding more content instead, which spared
            everyone a four-hour lecture on recursive dimensions.
          </Typography>
          <Typography group="heading" variant="h2">
            Interdimensional layout checklist
          </Typography>
          <List>
            <List.Item>Keep the portal gun away from production credentials.</List.Item>
            <List.Item>
              Confirm the sidebar works in dimension C-137 and at mobile widths.
            </List.Item>
            <List.Item>
              Never let Jerry approve a deployment because the button looks friendly.
            </List.Item>
            <List.Item>Test the footer before Mr. Meeseeks is asked to fix it.</List.Item>
            <List.Item>
              Label every dimension more clearly than Rick labels his browser tabs.
            </List.Item>
          </List>
          <Typography group="paragraph" variant="body_long">
            The next experiment involved a button labeled &quot;Do Not Press.&quot; Jerry pressed it
            before the page finished loading and was transported three pixels to the left. He
            described the experience as terrifying, while Summer called it the first useful
            alignment adjustment he had ever contributed.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            Morty keeps a careful list of every viewport they have visited: mobile dimension, tablet
            dimension, desktop dimension, and one unsettling dimension where every screen is exactly
            769 pixels wide. Rick refuses to discuss what happened at that breakpoint.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            Mr. Meeseeks was summoned to fix a tiny spacing issue. Unfortunately, the ticket said
            only &quot;make it look better,&quot; and three days later forty Meeseeks were arguing
            over whether visual balance could be measured with a ruler. The team now writes much
            more specific acceptance criteria.
          </Typography>
          <Typography group="heading" variant="h2">
            Rick&apos;s definitely safe release procedure
          </Typography>
          <List variant="numbered">
            <List.Item>Open a portal to the staging environment.</List.Item>
            <List.Item>
              Ask Morty whether the tests passed, then actually check the results.
            </List.Item>
            <List.Item>Distract the Council of Ricks with a debate about semicolons.</List.Item>
            <List.Item>
              Deploy during a timeline in which nobody is giving a presentation.
            </List.Item>
            <List.Item>Blame causality if the cache takes a minute to clear.</List.Item>
          </List>
          <Typography group="paragraph" variant="body_long">
            Down in the garage, a microverse civilization generates electricity by running snapshot
            tests. They believe every successful assertion powers a tiny sun. Rick knows it mostly
            powers the hot plate beside his workbench, but correcting them would create an awkward
            conversation about developer tooling.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            Beth reviewed the page hierarchy and approved it with one condition: nobody should
            confuse a header with a main region simply because both contain words. Jerry nodded
            thoughtfully and then asked which one was the sidebar, despite having used it five
            minutes earlier.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            Summer opened the developer tools and found six warnings from another dimension. Rick
            dismissed them as alternate-timeline problems. She fixed them anyway, because browsers
            rarely accept philosophical arguments as valid configuration.
          </Typography>
          <Typography group="heading" variant="h2">
            Items found in Rick&apos;s component inventory
          </Typography>
          <List>
            <List.Item>One responsive navigation system with suspicious scorch marks.</List.Item>
            <List.Item>Three reusable buttons, only one of which opens a portal.</List.Item>
            <List.Item>A plumbus component with no agreed-upon API.</List.Item>
            <List.Item>An error boundary that has seen things it refuses to discuss.</List.Item>
            <List.Item>A butter-passing robot waiting for a less specific user story.</List.Item>
            <List.Item>
              Seven deprecated gadgets Rick insists are still industry standard.
            </List.Item>
          </List>
          <Typography group="paragraph" variant="body_long">
            A version of Rick from a universe with perfect documentation arrived to explain the
            component API. Nobody trusted him. Perfect documentation was suspicious enough, but he
            also used every parameter correctly on the first attempt, prompting the Council to
            investigate him for prohibited time travel.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            Morty wondered whether users would really scroll this far. Rick replied that users will
            scroll through anything if they suspect the final paragraph contains the answer they
            need. Somewhere, an analytics dashboard flickered and added a new metric called
            existential scroll depth.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            The family tried pair programming once. Beth solved the difficult part, Summer found the
            edge case, Morty wrote the test, and Jerry moved the cursor while saying
            &quot;interesting&quot; at irregular intervals. Rick called the session inefficient
            because nobody let him replace the repository with a sentient crystal.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            There is a dimension where CSS properties are decided by courtroom trial. Padding
            presents its evidence, margin objects, and gap waits patiently to be recognized as the
            cleaner solution. Proceedings last for weeks whenever Rick serves as an expert witness
            and refuses to answer in anything shorter than a monologue.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            The Cromulons briefly appeared above the page and demanded that everyone show them what
            they had built. The layout rendered correctly at every requested size, so they awarded
            Earth seven points and moved on. It was the least stressful design review the team had
            experienced all quarter.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            Rick&apos;s preferred loading indicator is a portal revealing the finished page in a
            universe where the request has already completed. Legal rejected the approach due to
            data residency, causality, and the unresolved question of who pays the cloud bill in the
            destination universe.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            Morty proposed a normal spinner. It does not tear holes in spacetime, violate compliance
            policies, or require users to sign an interdimensional waiver. Sometimes the boring
            solution wins because it can ship before the universe reaches heat death.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            At this depth, the scrollbar has earned a meaningful career. It began as a small thumb
            near the top of the viewport and has now guided you through enough content to qualify
            for senior navigation status. Jerry has already asked whether it can endorse him for
            user experience on LinkedIn.
          </Typography>
          <Typography group="paragraph" variant="body_long">
            Eventually the portal fluid settles, the sidebar stays put, and the content reaches its
            genuinely final paragraph. You have tested scrolling, survived the references, and
            arrived near the footer without splitting the timeline. By C-137 standards, that counts
            as an exceptionally successful afternoon.
          </Typography>
        </Styled.Wrapper>
      </Page.Main>
      <Page.Footer>
        <Styled.Wrapper>
          <Typography group="paragraph" variant="body_long">
            ¯\_(ツ)_/¯ © 2026 Fusion Core Team
          </Typography>
        </Styled.Wrapper>
      </Page.Footer>
    </Page>
  );
};
