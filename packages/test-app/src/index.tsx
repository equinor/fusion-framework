import { Suspense } from 'react';
import ReactDOM from 'react-dom';

import Framework from 'FrameWork';
// import App from './App';

ReactDOM.render(
    <Suspense fallback={<h1>Loading Framework</h1>}>
        <Framework>
            <p>ok</p>
        </Framework>
    </Suspense>,
    document.getElementById('root')
);
