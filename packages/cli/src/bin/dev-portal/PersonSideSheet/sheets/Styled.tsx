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
        border-left: 3px solid var(--eds_interactive_primary__resting, rgba(0, 112, 121, 1));
        cursor: pointer;
    `,
    SwitchLabel: styled.div`
        display: flex;
        flex-direction: column;
        align-items: left;
        justify-content: center;
        width: 85%;
        transform: scale(0.9);
    `,
    Switch: styled.div`
        width: 15%;
        display: flex;
        justify-content: flex-end;
        transform: scale(0.9);
    `,
};
