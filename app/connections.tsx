import SheetView from "@/components/ui/SheetView";
import {
  addConnection,
  useConnections,
} from "@/hooks/useConnections";
import { Button, Host, List, Section, Text, TextField } from "@expo/ui/swift-ui";
import { tint } from "@expo/ui/swift-ui/modifiers";
import { router } from "expo-router";
import { useState } from "react";

function statusLabel(status: string): string {
  switch (status) {
    case "connected":
      return "Connected";
    case "connecting":
      return "Connecting...";
    default:
      return "Disconnected";
  }
}

export default function Connections() {
  const connections = useConnections((s) => s.connections);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!url.trim()) return;
    setAdding(true);
    setError(null);
    try {
      await addConnection(url.trim());
      setUrl("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setAdding(false);
    }
  }

  return (
    <SheetView id="connections">
      <Host style={{ flex: 1 }}>
        <List>
          <Section title="Add Signal K Server">
            <TextField
              placeholder="http://raspberrypi.local:3000"
              defaultValue={url}
              onChangeText={setUrl}
            />
            {error ? <Text>{error}</Text> : null}
            <Button
              modifiers={[tint("primary")]}
              label={adding ? "Connecting..." : "Add Server"}
              onPress={handleAdd}
            />
          </Section>

          {connections.length > 0 ? (
            <Section title="Connections">
              {connections.map((conn) => (
                <Button
                  key={conn.id}
                  label={`${conn.name} — ${statusLabel(conn.status)}`}
                  onPress={() => router.push({ pathname: "/connection/[id]", params: { id: conn.id } })}
                />
              ))}
            </Section>
          ) : null}
        </List>
      </Host>
    </SheetView>
  );
}
