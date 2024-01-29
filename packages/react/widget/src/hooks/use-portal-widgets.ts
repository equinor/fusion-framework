import { useFramework } from '@equinor/fusion-framework-react';

import { useMemo, useRef, useState } from 'react';
import { createElement } from '../util/element';
import { widgetRender } from '../render/render';
import { WidgetModule, WidgetProps } from '@equinor/fusion-framework-module-widget';
import { useAppModule } from '@equinor/fusion-framework-react-app';

export const usePortalWidgets = <TProps extends WidgetProps>(
    name: string,
    props?: TProps,
    widgetVersion?: {
        type: 'version' | 'tag';
        value: string;
    },
) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | undefined>();

    const fusion = useFramework<[WidgetModule]>();
    const widgetModule = useAppModule<WidgetModule>('widget');

    const module = fusion.modules.widget || widgetModule;

    const widgetRef = useRef<HTMLDivElement>(createElement());

    const widget = useMemo(() => {
        const widget = module.getWidget(name, widgetVersion);
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
    }, [name, props, widgetVersion, module, fusion]);

    return {
        widget,
        loading,
        error,
        widgetRef,
    };
};
