import { useEffect, useRef } from 'react';
import { useLoadWidget } from '../hooks/use-portal-widgets';
import { WidgetModule, WidgetProps } from '@equinor/fusion-framework-module-widget';
import { Fusion } from '@equinor/fusion-framework';

interface WidgetComponentProps<TProps extends WidgetProps> {
    readonly props?: TProps;
    readonly name: string;
    readonly widgetVersion?: {
        type: 'version' | 'tag';
        value: string;
    };
    readonly fusion: Fusion<[WidgetModule]>;
    readonly fallback?: React.ReactNode;
}

export const BaseWidget = <TProps extends WidgetProps>({
    name,
    fallback,
    props,
    widgetVersion,
    fusion,
}: WidgetComponentProps<TProps>) => {
    const ref = useRef<HTMLElement>(null);

    const provider = fusion.modules.widget;
    const { loading, error, widgetRef, widget } = useLoadWidget(provider, {
        name,
        props,
        widgetVersion,
        fusion,
    });

    useEffect(() => {
        const refEl = ref.current;
        const appEl = widgetRef.current;

        if (!(appEl && refEl)) {
            return;
        }

        refEl.appendChild(appEl);
        return () => {
            try {
                widget?.dispose();
                refEl.removeChild(appEl);
            } catch (err) {
                console.error(err);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [widget, ref.current, widgetRef]);

    if (error) {
        throw error;
    }

    if (loading) {
        return <>{fallback}</>;
    }

    return <section ref={ref} />;
};

export default BaseWidget;
