import { PropsWithChildren, useEffect, useRef } from 'react';
import { usePortalWidgets } from '../hooks/use-portal-widgets';
import { WidgetProps } from '@equinor/fusion-framework-module-widget';

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
    const ref = useRef<HTMLElement>(null);

    const { loading, error, widgetRef, widget } = usePortalWidgets(name, props, widgetVersion);

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
    }, [ref.current, widgetRef.current, widget]);

    if (error) {
        throw error;
    }

    if (loading) {
        return <>{children}</>;
    }

    return <section ref={ref} />;
};

export default Widget;
