---
'@equinor/fusion-framework-module-http': patch
---

__Improves error handling when processing json http response__

In packages/modules/http/src/errors.ts:
- The class HttpResponseError now has a generic parameter TResponse.
  - Added a static property Name to the class.
- Added a new class HttpJsonResponseError which extends HttpResponseError and also has generic parameters TType and TResponse.
  - Added a static property Name to the class.
  - Added a public property data of type TType.
  - Modified the constructor to accept an optional data parameter.

In packages/modules/http/src/lib/selectors/json-selector.ts:
- Added an import statement for HttpJsonResponseError.
- Modified the jsonSelector function to handle errors when parsing the response.
  - Added a try-catch block.
  - Changed the JSON parsing logic to store the parsed data in a variable data.
  - If the response is not OK, a HttpJsonResponseError is thrown with the appropriate error message, response object, and data property.
  - If there is an error parsing the response, a HttpJsonResponseError is thrown with the appropriate error message, response object, and cause property.
