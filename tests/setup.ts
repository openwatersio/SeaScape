// expo-symbols ships a native iOS-only component; mock it for tests
jest.mock('expo-symbols', () => {
  const React = require('react');
  return {
    SymbolView: ({ name, children }: { name: string; children?: any }) =>
      React.createElement('View', { testID: `symbol-${name}` }, children),
  };
});

// expo-router's Link needs a NavigationContainer; mock it as a pressable wrapper
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    Link: ({ href, children, ...props }: { href: string; children?: any }) =>
      React.createElement('Pressable', { testID: `link-${href}`, ...props }, children),
  };
});

// @maplibre/maplibre-react-native uses native modules; mock LocationManager
jest.mock('@maplibre/maplibre-react-native', () => ({
  LocationManager: { addListener: jest.fn() },
}));
