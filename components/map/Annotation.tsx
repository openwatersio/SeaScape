import { mapRef } from "@/hooks/useMapRef";
import useTheme from "@/hooks/useTheme";
import { type LngLat, Marker, MarkerProps } from "@maplibre/maplibre-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { AnnotationIcon, AnnotationIconProps } from "./AnnotationIcon";

const DOT_SIZE = 20;
const PIN_SIZE = 44;
const TAIL_HEIGHT = 11; // visual height = borderTopWidth(13) - overlap(2)

// With anchor="bottom", the collapsed dot needs to shift down to sit on the coordinate.
// When collapsed the tail is invisible but still occupies layout space.
const COLLAPSED_OFFSET = TAIL_HEIGHT + DOT_SIZE / 2;

const SPRING_CONFIG = { damping: 20, stiffness: 300 };

type AnnotationProps = Omit<MarkerProps, "children"> & {
  icon: AnnotationIconProps["name"];
  color: string;
  draggable?: boolean;
  onDragEnd?: (lngLat: LngLat) => void;
};

export function Annotation({
  icon,
  color,
  selected,
  draggable,
  lngLat: lngLatProp,
  onDragEnd,
  ...props
}: AnnotationProps) {
  const theme = useTheme();
  const prevSelected = useRef(selected);

  // --- Drag state ---
  const [lngLat, setLngLat] = useState<LngLat>(lngLatProp);
  const lngLatRef = useRef(lngLatProp);

  useEffect(() => {
    lngLatRef.current = lngLatProp;
    setLngLat(lngLatProp);
  }, [lngLatProp]);

  const gestureOffset = useRef<[number, number]>([0, 0]);

  const captureOffset = useCallback(async (absoluteX: number, absoluteY: number) => {
    const [xOffset, yOffset] = await mapRef.current?.project(lngLatRef.current) ?? [0, 0];
    gestureOffset.current = [absoluteX - xOffset, absoluteY - yOffset];
  }, []);

  useEffect(() => {
    dragTranslateX.value = 0;
    dragTranslateY.value = 0;
  }, [lngLat]);

  const finishDrag = useCallback((absoluteX: number, absoluteY: number) => {
    const [x, y] = gestureOffset.current;
    mapRef.current?.unproject([absoluteX - x, absoluteY - y]).then((result) => {
      if (result) {
        lngLatRef.current = result;
        setLngLat(result);
        onDragEnd?.(result);
      }
    });
  }, [onDragEnd]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Animations ---

  // Entrance
  const entranceY = useSharedValue(-50);
  const entranceScale = useSharedValue(0);

  useEffect(() => {
    entranceScale.value = withSpring(1, { damping: 50, stiffness: 1000 });
    entranceY.value = withSpring(0, { damping: 70, stiffness: 1000 });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Selection transition: 0 = collapsed (dot), 1 = expanded (pin)
  const expansion = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    if (prevSelected.current !== selected) {
      expansion.value = withSpring(selected ? 1 : 0, SPRING_CONFIG);
    }
    prevSelected.current = selected;
  }, [selected, expansion]);

  // Drag
  const dragTranslateX = useSharedValue(0);
  const dragTranslateY = useSharedValue(0);
  const dragLift = useSharedValue(0);
  const dragScale = useSharedValue(1);

  // Combined container style: entrance + expansion + drag
  const containerStyle = useAnimatedStyle(() => ({
    alignItems: "center",
    transform: [
      { translateX: dragTranslateX.value },
      { translateY: entranceY.value + dragLift.value + dragTranslateY.value + interpolate(expansion.value, [0, 1], [COLLAPSED_OFFSET, 0]) },
      { scale: entranceScale.value * dragScale.value },
    ],
  }));

  // Circle: animates between dot and pin size
  const circleSize = useAnimatedStyle(() => {
    const size = interpolate(expansion.value, [0, 1], [DOT_SIZE, PIN_SIZE]);
    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: interpolate(expansion.value, [0, 1], [1, 2]),
    };
  });

  // Icon: scales smoothly between collapsed and expanded
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(expansion.value, [0, 1], [12 / 26, 1]) }],
  }));

  // Tail: fades in/out and scales
  const tailStyle = useAnimatedStyle(() => ({
    opacity: expansion.value,
    transform: [{ scaleY: expansion.value }],
  }));

  // --- Gesture ---
  const pan = Gesture.Pan()
    .activateAfterLongPress(300)
    .enabled(draggable === true)
    .onStart((event) => {
      dragLift.value = withSpring(-10, { damping: 12, stiffness: 300 });
      dragScale.value = withSpring(1.15, { damping: 12, stiffness: 300 });
      scheduleOnRN(captureOffset, event.absoluteX, event.absoluteY);
    })
    .onUpdate((event) => {
      dragTranslateX.value = event.translationX;
      dragTranslateY.value = event.translationY;
    })
    .onEnd((event, success) => {
      dragTranslateX.value = event.translationX;
      dragTranslateY.value = event.translationY;
      dragLift.value = withSpring(0, { damping: 30, stiffness: 350 });
      dragScale.value = withSpring(1, { damping: 30, stiffness: 350 });
      scheduleOnRN(finishDrag, event.absoluteX, event.absoluteY);
    })
    .onFinalize((event, success) => {
      console.log("[pan] onFinalize success=", success, "state=", event.state);
    });

  return (
    <Marker
      anchor="bottom"
      lngLat={lngLat}
      style={{ zIndex: selected ? 1 : 0 }}
      {...props}
    >
      <GestureHandlerRootView unstable_forceActive>
        <GestureDetector gesture={pan}>
          <Animated.View style={containerStyle}>
            <Animated.View style={[styles.circle, { backgroundColor: color, borderColor: theme.surface }, circleSize]}>
              <Animated.View style={iconStyle}>
                <AnnotationIcon name={icon} color="white" size={26} />
              </Animated.View>
            </Animated.View>
            <Animated.View style={[styles.tail, { borderTopColor: theme.surface }, tailStyle]} />
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Marker>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderLeftColor: "transparent",
    borderRightWidth: 9,
    borderRightColor: "transparent",
    borderTopWidth: TAIL_HEIGHT + 2,
    marginTop: -2,
  },
});
