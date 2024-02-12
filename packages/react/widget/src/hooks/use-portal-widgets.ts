import { useMemo, useRef, useState } from 'react';
import { createElement } from '../util/element';
import { widgetRender } from '../render/render';
import { IWidgetModuleProvider, WidgetProps } from '@equinor/fusion-framework-module-widget';
import { Fusion } from '@equinor/fusion-framework';

export const usePortalWidgets = <TProps extends WidgetProps>(
    provider: IWidgetModuleProvider,
    cb: () => {
        name: string;
        props?: TProps;
        fusion: Fusion;
        widgetVersion?: {
            type: 'version' | 'tag';
            value: string;
        };
    },
) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | undefined>();

    const widgetRef = useRef<HTMLDivElement>(createElement());
    const { name, props, widgetVersion, fusion } = cb();
    const widget = useMemo(() => {
        const widget = provider.getWidget(name, widgetVersion);
        if (widget) {
            widget?.initialize().subscribe({
                next: ({ manifest, script }) => {
                    widgetRender({
                        script,
                        element: widgetRef.current,
                        config: {
                            env: {
                                manifest,
                            },
                            fusion,
                            props,
                        },
                    });
                },
                complete: () => {
                    setLoading(false);
                },
                error: (err) => {
                    setError(err);
                    setLoading(false);
                },
            });
            return widget;
        }
    }, [name, props, widgetVersion, provider, fusion]);

    return {
        widget,
        loading,
        error,
        widgetRef,
    };
};
