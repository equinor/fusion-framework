import styled from 'styled-components';
import type { ConnectionState, MessageRole, MessageTone } from './types.js';

export const Styled = {
  Root: styled.aside`
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    height: 100%;
    background: #1e1e1e;
    color: #d4d4d4;
    border-right: 1px solid #2d2d2d;
  `,
  Header: styled.header`
    display: grid;
    gap: 0.7rem;
    padding: 0.75rem;
    border-bottom: 1px solid #2d2d2d;
    background: #252526;
  `,
  HeaderTop: styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.75rem;
  `,
  HeaderEyebrow: styled.div`
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9da0a6;
  `,
  HeaderIntro: styled.div`
    display: grid;
    gap: 0.18rem;
  `,
  HeaderMeta: styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.72rem;
    color: #9da0a6;
    white-space: nowrap;
  `,
  StatusCard: styled.div<{ $state: ConnectionState }>`
    display: grid;
    gap: 0.28rem;
    padding: 0.65rem 0.7rem;
    border-radius: 6px;
    border: 1px solid
      ${({ $state }) => ($state === 'connected' ? '#1f6f46' : $state === 'connecting' ? '#5c4a2d' : '#5a2f2f')};
    background: ${({ $state }) => ($state === 'connected' ? '#173224' : $state === 'connecting' ? '#3b311f' : '#3a2323')};
  `,
  StatusTitle: styled.div`
    font-size: 0.8rem;
    font-weight: 600;
  `,
  StatusCopy: styled.div`
    font-size: 0.76rem;
    line-height: 1.45;
    color: #c5c8cc;
    word-break: break-word;
  `,
  HeaderActions: styled.div`
    display: flex;
    gap: 0.45rem;
    flex-wrap: wrap;
    align-items: center;
  `,
  Select: styled.select`
    border: 1px solid #3c3c3c;
    border-radius: 4px;
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.3rem 0.45rem;
    font-size: 0.74rem;
    min-width: 7.5rem;
  `,
  Timeline: styled.section`
    overflow: auto;
    padding: 0.75rem;
    display: grid;
    gap: 0.75rem;
    align-content: start;
  `,
  MessageRow: styled.article`
    display: flex;
  `,
  Message: styled.div<{ $role: MessageRole; $tone: MessageTone }>`
    width: 100%;
    border-radius: 6px;
    padding: 0.72rem 0.8rem;
    border: 1px solid
      ${({ $role, $tone }) => {
        if ($tone === 'error') {
          return '#5a2f2f';
        }

        if ($tone === 'success') {
          return '#1f6f46';
        }

        if ($role === 'user') {
          return '#0a4f82';
        }

        return '#3c3c3c';
      }};
    background: ${({ $role, $tone }) => {
      if ($tone === 'error') {
        return '#3a2323';
      }

      if ($tone === 'success') {
        return '#173224';
      }

      if ($role === 'user') {
        return '#04395e';
      }

      return '#252526';
    }};
  `,
  MessageMeta: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.32rem;
  `,
  MessageRole: styled.span`
    font-size: 0.72rem;
    font-weight: 600;
    color: #9da0a6;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  `,
  MessageTime: styled.span`
    font-size: 0.72rem;
    color: #9da0a6;
  `,
  MessageBody: styled.div`
    font-size: 0.88rem;
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-word;
  `,
  EmptyState: styled.section`
    border: 1px dashed #3c3c3c;
    border-radius: 6px;
    padding: 1rem;
    background: #252526;
    display: grid;
    gap: 0.35rem;
  `,
  ChangeSetCard: styled.section`
    display: grid;
    gap: 0.65rem;
    border: 1px solid #5c4a2d;
    border-radius: 6px;
    background: #2d271d;
    padding: 0.75rem;
  `,
  ChangeSetHeader: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  `,
  ChangeSetTitle: styled.div`
    font-size: 0.82rem;
    font-weight: 600;
    color: #f4d58d;
  `,
  FileList: styled.div`
    display: grid;
    gap: 0.5rem;
  `,
  FileCard: styled.section`
    display: grid;
    gap: 0.35rem;
    border: 1px solid #3c3c3c;
    border-radius: 6px;
    background: #1f1f1f;
    padding: 0.65rem;
  `,
  FilePath: styled.div`
    font-size: 0.76rem;
    font-weight: 600;
    color: #dcdcaa;
  `,
  Patch: styled.pre`
    margin: 0;
    overflow: auto;
    font-size: 0.74rem;
    line-height: 1.45;
    color: #d4d4d4;
    background: #111315;
    border-radius: 4px;
    padding: 0.6rem;
  `,
  ChangeSetActions: styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  `,
  RunFeedbackCard: styled.section<{ $status: 'running' | 'done' | 'error' }>`
    display: grid;
    gap: 0.55rem;
    border-radius: 6px;
    border: 1px solid
      ${({ $status }) => ($status === 'running' ? '#2f6f8c' : $status === 'error' ? '#7a3232' : '#2f7a50')};
    background: ${({ $status }) => ($status === 'running' ? '#173141' : $status === 'error' ? '#3b2323' : '#183428')};
    padding: 0.65rem;
  `,
  RunFeedbackHeader: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
  `,
  RunFeedbackTitle: styled.div`
    font-size: 0.8rem;
    font-weight: 600;
    color: #e2e8f0;
  `,
  RunFeedbackMeta: styled.div`
    margin-top: 0.2rem;
    font-size: 0.72rem;
    color: #b8c3ce;
  `,
  RunFeedbackToggle: styled.button`
    border: 1px solid #3c3c3c;
    border-radius: 4px;
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 0.2rem 0.45rem;
    font-size: 0.72rem;
    cursor: pointer;
  `,
  RunFeedbackBody: styled.div`
    max-height: 10rem;
    overflow: auto;
    border-radius: 4px;
    border: 1px solid #2a2a2a;
    background: rgba(0, 0, 0, 0.24);
    padding: 0.45rem 0.5rem;
    display: grid;
    gap: 0.25rem;
  `,
  RunFeedbackLine: styled.div`
    font-size: 0.75rem;
    line-height: 1.4;
    color: #d7dde5;
    word-break: break-word;
  `,
  Composer: styled.footer`
    border-top: 1px solid #2d2d2d;
    padding: 0.75rem;
    background: #1e1e1e;
  `,
  ComposerCard: styled.div`
    display: grid;
    gap: 0.55rem;
    border: 1px solid #3c3c3c;
    border-radius: 6px;
    background: #252526;
    padding: 0.7rem;
  `,
  ComposerInput: styled.textarea`
    width: 100%;
    min-height: 6.5rem;
    border: none;
    resize: vertical;
    background: transparent;
    color: #d4d4d4;
    font: inherit;
    font-size: 0.9rem;
    line-height: 1.55;
    padding: 0;

    &::placeholder {
      color: #8f949d;
    }

    &:focus {
      outline: none;
    }

    &:disabled {
      color: #8f949d;
      cursor: not-allowed;
    }
  `,
  ComposerFooter: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  `,
  ComposerHint: styled.div`
    font-size: 0.74rem;
    color: #9da0a6;
  `,
  ComposerActions: styled.div`
    display: flex;
    gap: 0.5rem;
  `,
};
