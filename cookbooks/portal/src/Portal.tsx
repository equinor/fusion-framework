export const Portal = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#cfd2d3',
      }}
    >
      <div
        style={{
          maxHeight: '90%',
          backgroundColor: 'white',
          borderRadius: '8px',
          overflow: 'auto',
          padding: '20px',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}
      >
        <h1 style={{ color: '#15c095' }}>Welcome to the CLI Demo Portal</h1>
        <p>This is a sample portal application.</p>
        {/* Add more portal-related UI components here */}
      </div>
    </div>
  );
};
