import styled from 'styled-components';
import { LogReader } from './components/LogReader';
import { Link } from 'react-router-dom';

const Styled = {
  Wrapper: styled.div`
    padding: 20px;
  `,
  LogWrapper: styled.div`
    margin-top: 20px;
    padding: 10px;
    background-color: #f0f0f0;
  `,
};

export const Portal = () => {
  return (
    <Styled.Wrapper>
      <h1>Analytics Module Cookbook</h1>
      <p>Demonstrates the analytics module functionality</p>

      <p>Click to emit a analytic event to the OpenTelemetry Collector</p>

      <button type="button" id="button-trigger">
        Trigger click event
      </button>

      <p>
        Or select a context in the context-selector above. This should emit an event to the
        OpenTelemetry Collector
      </p>

      <p>Or navigate:</p>
      <ul>
        <li>
          <Link to={'/'}>Home</Link>
        </li>
        <li>
          <Link to={'apps/app-admin'}>App admin</Link>
        </li>
        <li>
          <Link to={'apps/fusion-help-admin'}>Help admin</Link>
        </li>
        <li>
          <Link to={'apps/fusion-help-admin/app/app-admin'}>Help admin with app admin context</Link>
        </li>
        <li>
          <Link to={'apps/meetings'}>Meetings</Link>
        </li>
        <li>
          <Link to={'apps/reviews/94dd5f4d-17f1-4312-bf75-ad75f4d9572c/landingpage/dashboard'}>
            Reviews with Castberg context
          </Link>
        </li>
        <li>
          <Link to={'apps/pro-org'}>Pro org</Link>
        </li>
      </ul>

      <Styled.LogWrapper>
        <h3>View Analytics:</h3>
        <p>Newest on top</p>
        <LogReader />
      </Styled.LogWrapper>
    </Styled.Wrapper>
  );
};
