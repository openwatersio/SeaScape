// react-native-reanimated uses native worklets; mock for tests
jest.mock("react-native-reanimated", () => {
  const React = require("react");
  const View = require("react-native").View;
  return {
    __esModule: true,
    default: {
      View: React.forwardRef((props: any, ref: any) =>
        React.createElement(View, { ...props, ref }),
      ),
    },
    SlideInUp: { duration: () => ({ duration: () => ({}) }) },
    SlideOutUp: { duration: () => ({ duration: () => ({}) }) },
  };
});

// expo-symbols ships a native iOS-only component; mock it for tests
jest.mock("expo-symbols", () => {
  const React = require("react");
  return {
    SymbolView: ({ name, children }: { name: string; children?: any }) =>
      React.createElement("View", { testID: `symbol-${name}` }, children),
  };
});

// expo-router's Link needs a NavigationContainer; mock it as a pressable wrapper
jest.mock("expo-router", () => {
  const React = require("react");
  return {
    Link: ({ href, children, ...props }: { href: string; children?: any }) =>
      React.createElement(
        "Pressable",
        { testID: `link-${href}`, ...props },
        children,
      ),
  };
});

// @maplibre/maplibre-react-native uses native modules; mock LocationManager
jest.mock("@maplibre/maplibre-react-native", () => ({
  LocationManager: { addListener: jest.fn(), removeListener: jest.fn() },
}));

// expo-location uses native modules
jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(async () => ({
    status: "granted",
  })),
  requestBackgroundPermissionsAsync: jest.fn(async () => ({
    status: "granted",
  })),
  watchPositionAsync: jest.fn(async () => ({ remove: jest.fn() })),
  startLocationUpdatesAsync: jest.fn(),
  stopLocationUpdatesAsync: jest.fn(),
  hasStartedLocationUpdatesAsync: jest.fn(async () => false),
  Accuracy: { BestForNavigation: 6 },
}));

// expo-task-manager uses native modules
jest.mock("expo-task-manager", () => ({
  defineTask: jest.fn(),
}));

// react-native-safe-area-context uses native modules; mock insets
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: require("react-native").View,
  SafeAreaProvider: require("react-native").View,
}));
