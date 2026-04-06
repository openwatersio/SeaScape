import SheetView from "@/components/ui/SheetView";
import { describeUnit, getDepthUnits, getDistanceUnits, getSpeedUnits, getTemperatureUnits, setPreferredUnits, usePreferredUnits } from "@/hooks/usePreferredUnits";
import { Host, List, Picker, Section, Text, VStack } from "@expo/ui/swift-ui";
import { tag } from "@expo/ui/swift-ui/modifiers";
import { router, Stack } from "expo-router";

export default function Settings() {
  const speed = usePreferredUnits((s) => s.speed);
  const distance = usePreferredUnits((s) => s.distance);
  const depth = usePreferredUnits((s) => s.depth);
  const temperature = usePreferredUnits((s) => s.temperature);

  return (
    <SheetView id="settings">
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="xmark" onPress={() => router.dismiss()}>
          Close
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Host style={{ flex: 1 }}>
        <VStack alignment="leading">
          <List>
            <Section title="Preferred Units">
              <Picker
                label="Speed"
                selection={speed}
                onSelectionChange={(unit) => setPreferredUnits({ speed: unit })}
              >
                {getSpeedUnits().map((unit) => (
                  <Text key={unit} modifiers={[tag(unit)]}>
                    {describeUnit(unit).plural}
                  </Text>
                ))}
              </Picker>
              <Picker
                label="Distance"
                selection={distance}
                onSelectionChange={(unit) => setPreferredUnits({ distance: unit })}
              >
                {getDistanceUnits().map((unit) => (
                  <Text key={unit} modifiers={[tag(unit)]}>
                    {describeUnit(unit).plural}
                  </Text>
                ))}
              </Picker>
              <Picker
                label="Depth"
                selection={depth}
                onSelectionChange={(unit) => setPreferredUnits({ depth: unit })}
              >
                {getDepthUnits().map((unit) => (
                  <Text key={unit} modifiers={[tag(unit)]}>
                    {describeUnit(unit).plural}
                  </Text>
                ))}
              </Picker>
              <Picker
                label="Temperature"
                selection={temperature}
                onSelectionChange={(unit) => setPreferredUnits({ temperature: unit })}
              >
                {getTemperatureUnits().map((unit) => (
                  <Text key={unit} modifiers={[tag(unit)]}>
                    {describeUnit(unit).plural}
                  </Text>
                ))}
              </Picker>
            </Section>
          </List>
        </VStack>
      </Host>
    </SheetView>
  );
}
