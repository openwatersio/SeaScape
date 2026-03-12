import { useBottomSheetStore } from "@/hooks/useBottomSheetOffset";
import { BottomSheet as ExpoBottomSheet, Group, Host, RNHostView } from "@expo/ui/swift-ui";
import {
  interactiveDismissDisabled,
  presentationBackgroundInteraction,
  presentationDetents,
  presentationDragIndicator,
} from "@expo/ui/swift-ui/modifiers";
import { useEffect, useRef } from "react";
import { View, type LayoutChangeEvent } from "react-native";

type BottomSheetProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

export default function BottomSheet({ isOpen, onOpenChange, children }: BottomSheetProps) {
  const setHeight = useBottomSheetStore((s) => s.setHeight);
  const measuredHeight = useRef(0);

  const onLayout = (e: LayoutChangeEvent) => {
    measuredHeight.current = e.nativeEvent.layout.height;
    if (isOpen) setHeight(measuredHeight.current);
  };

  useEffect(() => {
    setHeight(isOpen ? measuredHeight.current : 0);
  }, [isOpen, setHeight]);

  return (
    <Host>
      <ExpoBottomSheet isPresented={isOpen} onIsPresentedChange={onOpenChange} fitToContents>
        <Group
          modifiers={[
            presentationDetents([{ fraction: 0.25 }, "medium"]),
            presentationDragIndicator("visible"),
            presentationBackgroundInteraction("enabled"),
            interactiveDismissDisabled(),
          ]}
        >
          <RNHostView matchContents>
            <View onLayout={onLayout}>{children}</View>
          </RNHostView>
        </Group>
      </ExpoBottomSheet>
    </Host>
  );
}
