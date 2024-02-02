import { PropsWithChildren } from 'react';
import { BaseWidget, WidgetModule, WidgetProps } from '@equinor/fusion-framework-react/widget';
import useAppModules from '../useAppModules';
import { Fusion } from '@equinor/fusion-framework-react';

interface WidgetComponentProps<TProps extends WidgetProps> {
    readonly props?: TProps;
    readonly name: string;
    readonly widgetVersion?: {
        type: 'version' | 'tag';
        value: string;
    };
}

export const Widget = <TProps extends WidgetProps>({
    name,
    children,
    props,
    widgetVersion,
}: PropsWithChildren<WidgetComponentProps<TProps>>) => {
    const appModules = useAppModules<[WidgetModule]>();
    return (
        <BaseWidget
            {...{
                name,
                props,
                widgetVersion,
                fusion: { modules: appModules } as Fusion<[WidgetModule]>,
            }}
        >
            {children}
        </BaseWidget>
    );
};

export default Widget;
