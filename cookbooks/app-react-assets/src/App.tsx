import memeUrl from './mount_batur.jpg';

export const App = () => (
  <div>
    <img
      src={memeUrl}
      alt="should display in cookbook"
      style={{ maxWidth: '100vw', height: 'auto', display: 'block' }}
    />
  </div>
);

export default App;
