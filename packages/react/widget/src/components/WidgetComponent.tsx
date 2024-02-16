import { WidgetModule, WidgetProps } from '@equinor/fusion-framework-module-widget';
import { useFramework } from '@equinor/fusion-framework-react';
import { BaseWidget } from './BaseWidget';

interface WidgetComponentProps<TProps extends WidgetProps> {
    readonly props?: TProps;
    readonly name: string;
    readonly widgetVersion?: {
        type: 'version' | 'tag';
        value: string;
    };
    readonly fallback?: React.ReactNode;
}

export const Widget = <TProps extends WidgetProps>({
    name,
    fallback,
    props,
    widgetVersion,
}: WidgetComponentProps<TProps>) => {
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
            {fallback}
        </BaseWidget>
    );
};
