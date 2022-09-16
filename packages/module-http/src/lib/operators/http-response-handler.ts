import { ProcessOperators } from './process-operators';

export class HttpResponseHandler<T = Response> extends ProcessOperators<T> {}

export default HttpResponseHandler;
