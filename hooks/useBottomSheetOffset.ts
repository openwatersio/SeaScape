import { useEffect } from "react";
import { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { create } from "zustand";

const useBottomSheetStore = create<{
  height: number;
  setHeight: (h: number) => void;
}>((set) => ({
  height: 0,
  setHeight: (height) => set({ height }),
}));

export { useBottomSheetStore };

/**
 * Returns an animated style that shifts content up by the current bottom sheet height.
 */
export function useBottomSheetOffset() {
  const height = useBottomSheetStore((s) => s.height);
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withTiming(height, { duration: 300 });
  }, [height, offset]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -offset.value }],
  }));

  return animatedStyle;
}
