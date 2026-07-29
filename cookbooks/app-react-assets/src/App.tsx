import memeUrl from './mount_batur.jpg';

/**
 * Displays the cookbook image asset at the maximum available viewport width.
 * @returns The image asset demonstration view.
 */
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
