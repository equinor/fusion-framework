import styled, { keyframes } from 'styled-components';
import { tokens } from '@equinor/eds-tokens';
import type { ConnectionState, MessageRole, MessageTone } from './types.js';

const palette = {
  bgLight: tokens.colors.ui.background__light.hex,
  bgMedium: tokens.colors.ui.background__medium.hex,
  textDefault: tokens.colors.text.static_icons__default.hex,
  textMuted: tokens.colors.text.static_icons__tertiary.hex,
  primary: tokens.colors.interactive.primary__resting.hex,
  warning: tokens.colors.interactive.warning__resting.hex,
  danger: tokens.colors.interactive.danger__resting.hex,
};

const pulseDot = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(0, 112, 121, 0.32);
  }

  70% {
    box-shadow: 0 0 0 6px rgba(0, 112, 121, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(0, 112, 121, 0);
  }
`;

export const Styled = {
  Root: styled.aside`
    display: grid;
    grid-template-rows: auto minmax(0, 1fr) auto;
    height: 100%;
    min-height: 0;
    background: ${palette.bgLight};
    color: ${palette.textDefault};
    border-right: 1px solid ${palette.bgMedium};
  `,
  Header: styled.header`
    position: relative;
    display: grid;
    gap: 0.25rem;
    padding: 0.45rem 0.6rem;
    border-bottom: 1px solid ${palette.bgMedium};
    background: ${palette.bgLight};
  `,
  HeaderTop: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  `,
  HeaderEyebrow: styled.div`
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${palette.textMuted};
  `,
  HeaderIntro: styled.div`
    display: grid;
    gap: 0.18rem;
  `,
  HeaderMeta: styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    font-size: 0.72rem;
    color: ${palette.textMuted};
    white-space: nowrap;
  `,
  TopIconButton: styled.button`
    width: 20px;
    height: 20px;
    min-width: 20px;
    min-height: 20px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: ${palette.textMuted};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    line-height: 1;

    &:hover {
      background: #e6edf4;
      color: ${palette.textDefault};
    }

    &:focus-visible {
      outline: 2px solid ${palette.primary};
      outline-offset: 1px;
    }
  `,
  FilterPopover: styled.div`
    position: absolute;
    top: calc(100% - 2px);
    right: 0.5rem;
    z-index: 12;
    min-width: 13rem;
    padding: 0.25rem;
    border: 1px solid ${palette.bgMedium};
    border-radius: 6px;
    background: #ffffff;
    box-shadow: 0 10px 24px rgba(18, 29, 45, 0.12);
  `,
  FilterMenuItem: styled.button`
    width: 100%;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: ${palette.textDefault};
    text-align: left;
    font-size: 0.72rem;
    line-height: 1.35;
    padding: 0.35rem 0.45rem;
    cursor: pointer;

    &:hover {
      background: #eef3f8;
    }

    &:focus-visible {
      outline: 2px solid ${palette.primary};
      outline-offset: 1px;
    }
  `,
  ConnectionDot: styled.span<{ $state: ConnectionState }>`
    width: 9px;
    height: 9px;
    border-radius: 50%;
    display: inline-block;
    background: ${({ $state }) =>
      $state === 'connected'
        ? '#00a651'
        : $state === 'connecting'
          ? palette.warning
          : palette.danger};
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.08);
  `,
  StatusCard: styled.div<{ $state: ConnectionState }>`
    display: grid;
    gap: 0.28rem;
    padding: 0.65rem 0.7rem;
    border-radius: 6px;
    border: 1px solid
      ${({ $state }) => ($state === 'connected' ? '#00a651' : $state === 'connecting' ? '#f5a623' : '#e74c3c')};
    background: ${({ $state }) => ($state === 'connected' ? '#e8f5e9' : $state === 'connecting' ? '#fff3e0' : '#ffebee')};
  `,
  StatusTitle: styled.div`
    font-size: 0.8rem;
    font-weight: 600;
    color: #2d2d2d;
  `,
  StatusCopy: styled.div`
    font-size: 0.76rem;
    line-height: 1.45;
    color: #444444;
    word-break: break-word;
  `,
  HeaderActions: styled.div`
    display: flex;
    gap: 0.45rem;
    flex-wrap: wrap;
    align-items: center;
  `,
  Select: styled.select`
    border: 1px solid ${palette.bgMedium};
    border-radius: 4px;
    background: #ffffff;
    color: ${palette.textDefault};
    padding: 0.3rem 0.45rem;
    font-size: 0.74rem;
    min-width: 7.5rem;
  `,
  Timeline: styled.section`
    overflow: auto;
    padding: 0.7rem;
    display: grid;
    gap: 0.65rem;
    align-content: start;
  `,
  MessageRow: styled.article<{ $role: MessageRole }>`
    display: flex;
    justify-content: ${({ $role }) => ($role === 'user' ? 'flex-end' : 'flex-start')};
  `,
  Message: styled.div<{ $role: MessageRole; $tone: MessageTone }>`
    width: ${({ $role }) => ($role === 'user' ? 'fit-content' : '100%')};
    max-width: ${({ $role }) => ($role === 'user' ? '88%' : '100%')};
    border-radius: 10px;
    padding: ${({ $role }) => ($role === 'user' ? '0.82rem 0.9rem' : '0.35rem 0')};
    border: 1px solid
      ${({ $role, $tone }) => {
        if ($role !== 'user') {
          return 'transparent';
        }

        if ($tone === 'error') {
          return palette.danger;
        }

        if ($tone === 'success') {
          return '#9bd6a0';
        }

        if ($role === 'user') {
          return palette.primary;
        }

        return palette.bgMedium;
      }};
    background: ${({ $role, $tone }) => {
      if ($role !== 'user') {
        return 'transparent';
      }

      if ($tone === 'error') {
        return '#fff3f3';
      }

      if ($tone === 'success') {
        return '#eef9f0';
      }

      if ($role === 'user') {
        return '#edf5ff';
      }

      return '#ffffff';
    }};
    box-shadow: ${({ $role }) => ($role === 'user' ? '0 1px 0 rgba(18, 29, 45, 0.03)' : 'none')};
  `,
  MessageMeta: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-bottom: 0.4rem;
  `,
  MessageRole: styled.span`
    font-size: 0.68rem;
    font-weight: 700;
    color: ${palette.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.06em;
  `,
  MessageTime: styled.span`
    font-size: 0.68rem;
    color: ${palette.textMuted};
  `,
  MessageRoleWrap: styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;
  `,
  MessageRoleIcon: styled.span`
    color: ${palette.primary};
    display: inline-flex;
    align-items: center;
    justify-content: center;
  `,
  MessageBody: styled.div`
    font-size: 0.94rem;
    line-height: 1.62;
    letter-spacing: 0.005em;
    font-weight: 430;
    white-space: pre-wrap;
    word-break: break-word;
    color: ${palette.textDefault};
  `,
  TelemetryDetails: styled.details`
    margin-top: 0.5rem;
    border: 1px solid #d6dfeb;
    border-radius: 8px;
    background: #f7fafd;
    overflow: hidden;
  `,
  TelemetrySummary: styled.summary`
    cursor: pointer;
    user-select: none;
    padding: 0.38rem 0.52rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.01em;
    color: #5f6f82;

    &:hover {
      color: #2a3b4f;
      background: #edf3f9;
    }
  `,
  TelemetryBody: styled.pre`
    margin: 0;
    padding: 0.5rem 0.58rem 0.58rem;
    border-top: 1px solid #dce5ef;
    background: #f3f7fb;
    color: #5a6a7c;
    font-size: 0.7rem;
    line-height: 1.45;
    white-space: pre-wrap;
    word-break: break-word;
  `,
  EmptyState: styled.section`
    border: 1px dashed ${palette.bgMedium};
    border-radius: 10px;
    padding: 0.7rem;
    background: #f5f8fb;
    display: grid;
    gap: 0.35rem;
  `,
  ActionLine: styled.section`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.25rem 0.5rem;
    border-bottom: 1px solid ${palette.bgMedium};
    background: #f3f6fa;
  `,
  ActionLineText: styled.div`
    font-size: 0.68rem;
    color: ${palette.textMuted};
  `,
  ActionLineActions: styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  `,
  ChangeSetCard: styled.section`
    display: grid;
    gap: 0.65rem;
    border: 1px solid ${palette.warning};
    border-radius: 6px;
    background: #fffbf0;
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
    color: #d97706;
  `,
  FileList: styled.div`
    display: grid;
    gap: 0.5rem;
  `,
  FileCard: styled.section`
    display: grid;
    gap: 0.45rem;
    border: 1px solid #d2dbe6;
    border-radius: 8px;
    background: #f9fbfd;
    padding: 0.65rem 0.7rem;
  `,
  FileSummaryRow: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.65rem;
  `,
  FileSummaryLeft: styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    min-width: 0;
  `,
  FileIcon: styled.span`
    display: inline-flex;
    align-items: center;
    color: #0f62fe;
    flex-shrink: 0;
  `,
  FileEditedTag: styled.span`
    font-size: 0.72rem;
    font-weight: 600;
    color: #607084;
    flex-shrink: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  `,
  FileSummaryStats: styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.32rem;
    flex-shrink: 0;
  `,
  FileAdded: styled.span`
    font-size: 0.8rem;
    font-weight: 700;
    color: #14833b;
  `,
  FileRemoved: styled.span`
    font-size: 0.8rem;
    font-weight: 700;
    color: #c43737;
  `,
  FilePatchDetails: styled.details`
    border-top: 1px dashed #d8e1eb;
    padding-top: 0.35rem;
  `,
  FilePatchSummary: styled.summary`
    cursor: pointer;
    user-select: none;
    font-size: 0.72rem;
    color: #607084;

    &:hover {
      color: #1f2a37;
    }
  `,
  FilePath: styled.div`
    font-size: 0.8rem;
    font-weight: 600;
    color: #1f3c5a;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  Patch: styled.pre`
    margin: 0.4rem 0 0;
    overflow: auto;
    font-size: 0.74rem;
    line-height: 1.45;
    color: #1f2a37;
    background: #ffffff;
    border-radius: 4px;
    padding: 0.6rem;
    border: 1px solid #d7e0ea;
    white-space: pre-wrap;
    word-break: break-word;
  `,
  PatchLine: styled.span<{ $tone: 'default' | 'meta' | 'addition' | 'deletion' }>`
    display: block;
    color: ${({ $tone }) => {
      if ($tone === 'addition') {
        return '#14833b';
      }

      if ($tone === 'deletion') {
        return '#c43737';
      }

      if ($tone === 'meta') {
        return '#47617d';
      }

      return '#1f2a37';
    }};
  `,
  ChangeSetActions: styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  `,
  RunFeedbackCard: styled.section<{ $status: 'running' | 'done' | 'error' }>`
    display: grid;
    gap: 0.35rem;
    border: 1px solid #d8e1eb;
    border-radius: 8px;
    background: #fbfcfe;
    padding: 0.55rem 0.6rem;
  `,
  RunFeedbackCompactCard: styled.section`
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.45rem;
    align-items: start;
    border: 1px solid #d8e1eb;
    border-radius: 8px;
    background: #fbfcfe;
    padding: 0.45rem 0.55rem;
  `,
  RunFeedbackCompactIcon: styled.span<{ $kind: 'info' | 'warning' | 'error' }>`
    color: ${({ $kind }) => ($kind === 'error' ? '#8e1d1d' : $kind === 'warning' ? '#8c5600' : '#005f8c')};
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: 0.08rem;
  `,
  RunFeedbackCompactText: styled.div`
    display: grid;
    gap: 0.08rem;
    min-width: 0;
  `,
  RunFeedbackCompactAction: styled.div`
    font-size: 0.77rem;
    font-weight: 650;
    line-height: 1.35;
    color: #2b3b4f;
    word-break: break-word;
  `,
  RunFeedbackCompactDetail: styled.div`
    font-size: 0.72rem;
    line-height: 1.35;
    color: #5f6f82;
    word-break: break-word;
  `,
  RunFeedbackHeader: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.6rem;
  `,
  RunFeedbackMeta: styled.div`
    margin-top: 0.2rem;
    font-size: 0.72rem;
    color: #6f7378;
  `,
  RunFeedbackToggle: styled.button`
    border: 1px solid #d6e0ea;
    border-radius: 4px;
    background: #f8fbff;
    color: #314357;
    padding: 0.2rem 0.45rem;
    font-size: 0.72rem;
    cursor: pointer;
    
    &:hover {
      background: #edf3f9;
    }
  `,
  RunFeedbackBody: styled.div`
    max-height: 12rem;
    overflow: auto;
    border: 1px solid #e9eff5;
    border-radius: 6px;
    background: #ffffff;
    padding: 0.45rem 0.5rem;
  `,
  RunFeedbackTimeline: styled.div`
    display: grid;
    gap: 0.4rem;
  `,
  RunFeedbackStage: styled.section`
    display: grid;
    gap: 0.28rem;

    &:not(:last-child) {
      margin-bottom: 0.12rem;
      padding-bottom: 0.3rem;
      border-bottom: 1px solid #e5edf5;
    }
  `,
  RunFeedbackStageHeader: styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-height: 1.05rem;
  `,
  RunFeedbackStageDot: styled.span<{ $active: boolean }>`
    width: 0.46rem;
    height: 0.46rem;
    border-radius: 50%;
    background: ${({ $active }) => ($active ? palette.primary : palette.textMuted)};
    animation: ${({ $active }) => ($active ? pulseDot : 'none')} 1.2s ease-out infinite;
  `,
  RunFeedbackStageIcon: styled.span`
    color: ${palette.primary};
    display: inline-flex;
    align-items: center;
    justify-content: center;
  `,
  RunFeedbackStageTitle: styled.span`
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #5f7387;
  `,
  RunFeedbackTimelineItem: styled.div`
    position: relative;
    display: grid;
    grid-template-columns: 1rem minmax(0, 1fr);
    gap: 0.52rem;
    align-items: start;

    &:not(:last-child)::after {
      content: '';
      position: absolute;
      top: 0.95rem;
      left: 0.49rem;
      bottom: -0.52rem;
      width: 1px;
      background: #cfdce9;
    }
  `,
  RunFeedbackNode: styled.span<{ $kind: 'info' | 'warning' | 'error' }>`
    width: 0.62rem;
    height: 0.62rem;
    border-radius: 50%;
    margin-top: 0.22rem;
    display: inline-block;
    color: ${({ $kind }) => ($kind === 'error' ? palette.danger : $kind === 'warning' ? palette.warning : palette.primary)};
    background: ${({ $kind }) =>
      $kind === 'error' ? '#ffe3e3' : $kind === 'warning' ? '#fff1d6' : '#dff4ff'};
  `,
  RunFeedbackContent: styled.div`
    display: grid;
    gap: 0.08rem;
    min-width: 0;
  `,
  RunFeedbackIcon: styled.span<{ $kind: 'info' | 'warning' | 'error' }>`
    width: 0.95rem;
    height: 0.95rem;
    margin-top: 0.08rem;
    color: ${({ $kind }) => ($kind === 'error' ? '#8e1d1d' : $kind === 'warning' ? '#8c5600' : '#005f8c')};
    display: inline-flex;
    align-items: center;
    justify-content: center;

    & > svg {
      width: 0.9rem;
      height: 0.9rem;
    }
  `,
  RunFeedbackAction: styled.div`
    font-size: 0.79rem;
    font-weight: 650;
    line-height: 1.45;
    color: #2b3b4f;
    word-break: break-word;
  `,
  RunFeedbackActionRow: styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.38rem;
    flex-wrap: wrap;
  `,
  RunFeedbackFilePill: styled.span`
    font-size: 0.76rem;
    font-weight: 600;
    color: #2a4664;
    border: 1px solid #d1dbe8;
    background: #f4f8fd;
    border-radius: 999px;
    padding: 0.07rem 0.42rem;
    max-width: 16rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  RunFeedbackInlineMeta: styled.span`
    font-size: 0.72rem;
    color: #6b7c8f;
    white-space: nowrap;
  `,
  RunFeedbackEditRow: styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    flex-wrap: wrap;
  `,
  RunFeedbackEditFile: styled.span`
    font-size: 0.78rem;
    font-weight: 600;
    color: #2a4664;
    border: 1px solid #d1dbe8;
    background: #f4f8fd;
    border-radius: 999px;
    padding: 0.06rem 0.42rem;
    max-width: 14rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  RunFeedbackEditAdded: styled.span`
    font-size: 0.74rem;
    font-weight: 700;
    color: #14833b;
  `,
  RunFeedbackEditRemoved: styled.span`
    font-size: 0.74rem;
    font-weight: 700;
    color: #c43737;
  `,
  RunFeedbackDetail: styled.div`
    font-size: 0.73rem;
    line-height: 1.4;
    color: #5f6f82;
    word-break: break-word;
  `,
  Composer: styled.footer`
    border-top: 1px solid #d7dee6;
    padding: 0.45rem 0.5rem;
    background: #f3f6fa;
  `,
  ComposerCard: styled.div`
    display: grid;
    gap: 0.45rem;
    border: 1px solid #ced7e2;
    border-radius: 8px;
    background: #ffffff;
    padding: 0.58rem;
  `,
  ComposerControls: styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.45rem;

    @media (max-width: 640px) {
      grid-template-columns: minmax(0, 1fr);
    }
  `,
  ComposerInput: styled.textarea`
    width: 100%;
    min-height: 5.6rem;
    border: none;
    resize: vertical;
    background: transparent;
    color: #1f2a37;
    font: inherit;
    font-size: 0.94rem;
    line-height: 1.6;
    padding: 0;

    &::placeholder {
      color: #8694a3;
    }

    &:focus {
      outline: none;
    }

    &:disabled {
      color: #8694a3;
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
    font-size: 0.68rem;
    color: #607084;
  `,
  ComposerActions: styled.div`
    display: flex;
    gap: 0.5rem;
  `,
};
