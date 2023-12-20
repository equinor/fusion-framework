import styled from 'styled-components';
export const Styled = {
    SwitchList: styled.ul`
        list-style: none;
        padding-left: 0;
    `,
    SwitchListItem: styled.li`
        display: flex;
        flex-flow: row nowrap;
        justify-content: space-between;
        margin: 1em 0;
        line-height: 1;
        border-left: 5px solid var(--eds_interactive_primary__resting, rgba(0, 112, 121, 1));
        padding-top: 0.5em;
        padding-left: 0.5em;
        cursor: pointer;
    `,
    SwitchLabel: styled.div`
        transform: scale(0.9);
    `,
};
