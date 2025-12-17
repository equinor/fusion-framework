# Cookbook Portal for Analytics

This cookbook demonstrates the analytics module usage in a portal.

We need to have a way to test the analytics module in a portal. The portal has
an app loader and is functional as a normal portal.

With the collectors and adapters configured, this cookbook can be used to test
how and when the different events are triggered, as well as seeing what data
they include in the table.

## Collectors

The analytics module can be configured with several collectors, emitting events
when they happen.

The cookbook is configured with the following collectors:

- `ContextSelectedCollector` - emits when a context is selected.
- `AppSelectedCollector` - emits when an app is selected.
- `AppLoadedCollector` - emits when an app is fully loaded.
- an event listener for a custom button - emits when the button is clicked.

In addition the `LogReader` component uses the `useTrackFeature` to manually emit
event when the logs are fetched and when the logs are cleared.
This is to simulate the usage of manual feature tracking - not configured as a
collector.

## Adapters

The analytics module can be configured with several adapters, processing the
emitted events.

The cookbook is configured with the following adapters:

- `ConsoleAnalyticsAdapter` - will log the event to the console.
- `FusionAnalyticsAdapter`, with `OTLPLogExporter` - will post the event to an
  internal route for this cookbook. The route will append the event JSON to the
  cookbook log file. Read more below.
- `FusionAnalyticsAdapter`, with `FusionOTLPLogExporter` - will post the event with
  a `IHttpClient`. The cookbook is configured to use the `httpClient` from
  `monitor` in service discovery.

### FusionAnalyticsAdapter

The `FusionAnalyticsAdapter` can be instantiated with a log exporter. The log
exporter is a interface from Open Telemetry. We have configured two adapters
with different exporters as mentioned above.

#### OTLPLogExporter

`OTLPLogExporter` is the default from Open Telemetry. And is configured to use
the custom endpoint `/@fusion-api/api/logs` to handle the request - read more
below.

#### FusionOTLPLogExporter

The `FusionOTLPLogExporter` is a custom log exported extending the
`OTLPExporterBase`. The only difference is that the transport is changed to a
custom `HttpClientExporterTransport` taking a `IHttpClient` as argument.
This will let us use our normal http clients without having to manually deal
with auth/MSAL etc.
The cookbook is set up to use the service discovery `monitor` endpoint.

## Log file

The cookbook has a 'log file' with all events. The log file is filled with
content from the `FusionAnalyticsAdapter` with `OTLPLogExporter`.

The log file is `./log.txt`.

The cookbook is configured with 3 custom paths in `dev-server.config.ts`:

- `/logs` - reading the contents log file.
- `/api/logs` - appending the request body to the log file.
- `/api/clearlogs` - clearing the contents of the log file.

## The cookbook

The cookbook will display some links to different apps (with some link directly
to a context within that app) - use these links to trigger app change events
and context change events.

Below the links there is a table. The table is a presentation of the `log file`
mentioned above. All events emitted should be present in this table.
The table has two buttons right above it for fetching the data (log file) again
and to clear - to clear the contents of the log file.
