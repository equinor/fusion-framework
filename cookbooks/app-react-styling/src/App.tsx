import { ThemeProvider, theme } from '@equinor/fusion-react-styles';
import { Container, Title, Card, Text, Button, Demo } from './components';
import { useState } from 'react';

const AppContent = () => {
  const [buttonType, setButtonType] = useState<'primary' | 'secondary'>('secondary');
  const [showDemo, setShowDemo] = useState(false);

  const handleButtonClick = () => {
    setButtonType(buttonType === 'primary' ? 'secondary' : 'primary');
    setShowDemo((enabled) => !enabled);
  };

  return (
    <Container>
      <Title>🎨 Fusion React Styles Test</Title>

      <Card>
        <Text>
          <strong>Testing @equinor/fusion-react-styles@2.0.0-preview.1</strong>
        </Text>
        <Text>
          This cookbook tests the React 19 compatible version of fusion-react-styles with
          Material-UI dependency removed.
        </Text>
        <Text>
          ✅ ThemeProvider working
          <br />✅ makeStyles and createStyles working
          <br />✅ Classes instead of inline styles
          <br />✅ Theme object accessible via .css property
          <br />✅ No Material-UI dependencies
        </Text>
        <Button onClick={handleButtonClick} type={buttonType}>
          Test Button Click
        </Button>
      </Card>

      {showDemo && <Demo />}

      <Card>
        <Text>
          <strong>Styling Pattern:</strong>
        </Text>
        <Text>
          Components use makeStyles with createStyles
          <br />
          Theme values accessed via .css property
          <br />
          Multiple classes can be combined with clsx
          <br />
          Example: className=&#123;clsx(classes.button, isActive && classes.active)&#125;
        </Text>
      </Card>

      <Card>
        <Text>
          <strong>Stylesheet Cleanup Test:</strong>
        </Text>
        <Text>
          Toggle the demo component to test if stylesheets are properly removed when components
          unmount.
        </Text>
      </Card>
    </Container>
  );
};

export const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;
