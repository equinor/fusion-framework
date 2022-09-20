# Application adn widget loading and publishing

An `AppAPI Service` should serve as proxy api for Verdaccio se fig.1. extending it with fusion `appManifest`. It should handle cashing and file verification.

> Fig.1 AppLoading

```mermaid
sequenceDiagram

    participant Portal
    participant Api
    participant Database
    participant Verdaccio 

    Note over Portal: api/app/:key
    Portal ->> Api: get app info 
    Api ->> Database: Read application manifest data
    Database -->> Api: 
    Note over Api: Extract bundle information
    Api ->> Verdaccio: load bundle
    Verdaccio -->> Api: 
    Note over Api: Extract metadata
    Note over Api: Extract Javascript application
    Api ->> Portal: Serve application
    
```

## App Publishing

As an Fusion app developer the proses of deploying a application should be as simple as
`npm publish`, but of corse, some setup is requeued.

it has ben purposed to use Verdaccio the managing for version and handling the application / widgets. Verdaccio is a lightweight Node.js private proxy registry.

> Fig.1 Code Publish

```mermaid
sequenceDiagram

    participant App
    participant Verdaccio 

    Note over App: npm publish
    App ->> Verdaccio: publish tarball to verdaccio
    
```

>Verdaccio is a simple, zero-config-required local private NPM registry. No need for an entire database just to get started.

Verdaccio comes out of the box with its own tiny database, and the ability to proxy other registries (eg. npmjs.org), also introduces caching the downloaded modules along the way. For those who are looking to extend their storage capabilities, Verdaccio supports various community-made plugins to hook into services such as Amazon's S3, Google Cloud Storage or create your own plugin.

```bash
docker pull verdaccio/verdaccio
```

```mermaid
graph LR

    classDef verdaccio fill:#006699,stroke:none,text-align:left,color:#fff;
    classDef api fill:#008899,stroke:none,color:#fff;
    classDef portal fill:#007766,stroke:none,color:#fff;
    classDef app fill:#990066,stroke:none,color:#fff;
    classDef database fill:#997766,stroke:none,color:#fff;

    vd[Verdaccio]:::verdaccio
    appApi[Fusion Application Api]:::api
    appApiDb[Fusion Application Database]:::database
    appApi --> appApiDb

    portal[Fusion Portal]:::portal
    portalApi[Fusion Portal Api]:::api
    app[Fusion Application]:::app
    adminApp[Fusion Admin Application]:::app
    
    adminApp --> appApi

    subgraph Verdaccio
        vd[Verdaccio regestry]:::verdaccio
        vd-db[Verdaccio Database]:::database
        vd-file[Verdaccio Storage Mounting Point]:::verdaccio
        vd --> vd-db
        vd --> vd-file
    end
    vd-file --> azure-file
    azure-file[Azure File Storage]:::database

    appApi --Request app--> vd
    vd --Returns application tarball--> appApi
    portal --> portalApi --> appApi
    app --Published application tarball--> vd

    

    

```

## Fusion App

```TS

    export type RenderTeardown = VoidFunction;

    export const renderComponent = (renderer: ComponentRenderer) => {
        return (el: HTMLElement, args: ComponentRenderArgs): RenderTeardown => {
            const Component = renderer(args.fusion, args.env);
            return render(el, Component);
        };
    };

    const render = (el: Element, Component: FunctionComponent): RenderTeardown => {
        ReactDOM.render(
            <StrictMode>
                <Suspense fallback={<AppLoading/>}>
                    <Component />
                </Suspense>
            </StrictMode>,
            el
        );
        return () => {
            ReactDOM.unmountComponentAtNode(el);
        };
    };

```
