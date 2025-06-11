import { Apploader } from '@equinor/fusion-framework-react-app/apploader';

export const App = () => {
  return (
    <div>
      <h1>Hello Fusion app</h1>
      <h2>App Loader</h2>
      <Apploader appKey="experience-to-learning-report" />
    </div>
  );
};

export default App;
