import { PropsWithChildren } from 'react';
import { WidgetModule, WidgetProps } from '@equinor/fusion-framework-module-widget';
import { Fusion } from '@equinor/fusion-framework';
import useFramework from '../../useFramework';
import { BaseWidget } from './BaseWidget';

interface WidgetComponentProps<TProps extends WidgetProps> {
    readonly props?: TProps;
    readonly name: string;
    readonly widgetVersion?: {
        type: 'version' | 'tag';
        value: string;
    };
    readonly fusion: Fusion<[WidgetModule]>;
}

export const Widget = <TProps extends WidgetProps>({
    name,
    children,
    props,
    widgetVersion,
}: PropsWithChildren<WidgetComponentProps<TProps>>) => {
    const fusion = useFramework<[WidgetModule]>();
    return (
        <BaseWidget
            {...{
                name,
                props,
                widgetVersion,
                fusion,
            }}
        >
            {children}
        </BaseWidget>
    );
};
