import { FusionApploader } from '@equinor/fusion-framework-react-app/fusion-apploader';

export const App = () => {

  return (
    <div>
      <h1>Hello Fusion app</h1>
      <h2>App Loader</h2>
      <FusionApploader appKey="experience-to-learning-report" />
    </div>
  );
};

export default App;
