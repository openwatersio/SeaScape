import useTheme from "@/hooks/useTheme";
import type {
  ChartSourceType,
  MBTilesOptions,
  RasterOptions,
  StyleOptions,
} from "@/lib/chartSources";
import { importMBTilesFile } from "@/lib/mbtiles";
import {
  Button,
  Picker,
  Section,
  Stepper,
  Text,
  TextField,
} from "@expo/ui/swift-ui";
import {
  disabled,
  foregroundStyle,
  frame,
  pickerStyle,
  tag,
} from "@expo/ui/swift-ui/modifiers";
import { File } from "expo-file-system";
import { useCallback, useState } from "react";

export type FormType = ChartSourceType;

export type OptionsFormProps = {
  options: string | null;
  onOptionsChange: (options: string | null) => void;
  /** Called when the form has a suggested name (e.g. from MBTiles metadata). */
  onNameSuggestion?: (name: string) => void;
};

function StyleUrlForm({ options, onOptionsChange }: OptionsFormProps) {
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);

  const existing = options
    ? (JSON.parse(options) as StyleOptions).url
    : undefined;

  const handleChange = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        setError(null);
        onOptionsChange(null);
        return;
      }
      setError(null);
      onOptionsChange(JSON.stringify({ url: trimmed }));
    },
    [onOptionsChange],
  );

  return (
    <Section footer={<Text>URL to a MapLibre style JSON</Text>}>
      <TextField
        placeholder="https://..."
        defaultValue={existing}
        onChangeText={handleChange}
        autocorrection={false}
        keyboardType="url"
      />
      {error ? (
        <Text modifiers={[foregroundStyle(theme.danger)]}>{error}</Text>
      ) : null}
    </Section>
  );
}

const TILE_SIZES = [256, 512, 1024] as const;
const DEFAULT_TILE_SIZE = 256;
const DEFAULT_MIN_ZOOM = 0;
const DEFAULT_MAX_ZOOM = 22;

function RasterForm({ options, onOptionsChange }: OptionsFormProps) {
  const theme = useTheme();

  const existing: RasterOptions | null = options
    ? (JSON.parse(options) as RasterOptions)
    : null;

  const [url, setUrl] = useState(existing?.tiles?.[0] ?? "");
  const [tileSize, setTileSize] = useState<number>(
    existing?.tileSize ?? DEFAULT_TILE_SIZE,
  );
  const [minZoom, setMinZoom] = useState<number>(
    existing?.minZoom ?? DEFAULT_MIN_ZOOM,
  );
  const [maxZoom, setMaxZoom] = useState<number>(
    existing?.maxZoom ?? DEFAULT_MAX_ZOOM,
  );
  const [error, setError] = useState<string | null>(null);

  const emit = useCallback(
    (next: {
      url?: string;
      tileSize?: number;
      minZoom?: number;
      maxZoom?: number;
    }) => {
      const nextUrl = (next.url ?? url).trim();
      if (!nextUrl) {
        setError(null);
        onOptionsChange(null);
        return;
      }
      const hasXYZ =
        nextUrl.includes("{z}") &&
        nextUrl.includes("{x}") &&
        nextUrl.includes("{y}");
      if (!hasXYZ && !nextUrl.includes("{bbox-epsg-3857}")) {
        setError("URL must contain {z}/{x}/{y} or {bbox-epsg-3857}");
        onOptionsChange(null);
        return;
      }

      setError(null);
      onOptionsChange(
        JSON.stringify({
          tiles: [nextUrl],
          tileSize: next.tileSize ?? tileSize,
          minZoom: next.minZoom ?? minZoom,
          maxZoom: next.maxZoom ?? maxZoom,
        } satisfies RasterOptions),
      );
    },
    [url, tileSize, minZoom, maxZoom, onOptionsChange],
  );

  return (
    <>
      <Section
        footer={
          <Text>
            Tile URL with {"{z}/{x}/{y}"} or {"{bbox-epsg-3857}"}
          </Text>
        }
      >
        <TextField
          placeholder="https://..."
          defaultValue={url}
          onChangeText={(v) => {
            setUrl(v);
            emit({ url: v });
          }}
          autocorrection={false}
          keyboardType="url"
        />
        {error ? (
          <Text modifiers={[foregroundStyle(theme.danger)]}>{error}</Text>
        ) : null}
      </Section>

      <Section>
        <Picker
          label="Tile size"
          selection={String(tileSize)}
          onSelectionChange={(v) => {
            const size = Number(v);
            setTileSize(size);
            emit({ tileSize: size });
          }}
          modifiers={[pickerStyle("menu")]}
        >
          {TILE_SIZES.map((size) => (
            <Text key={size} modifiers={[tag(String(size))]}>
              {size}
            </Text>
          ))}
        </Picker>
        <Stepper
          label={`Min zoom: ${minZoom}`}
          value={minZoom}
          min={0}
          max={maxZoom}
          step={1}
          onValueChange={(v) => {
            setMinZoom(v);
            emit({ minZoom: v });
          }}
        />
        <Stepper
          label={`Max zoom: ${maxZoom}`}
          value={maxZoom}
          min={minZoom}
          max={24}
          step={1}
          onValueChange={(v) => {
            setMaxZoom(v);
            emit({ maxZoom: v });
          }}
        />
      </Section>
    </>
  );
}

function CustomForm({ options, onOptionsChange }: OptionsFormProps) {
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);

  const existing = options ?? undefined;

  const handleChange = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        setError(null);
        onOptionsChange(null);
        return;
      }
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.version !== 8) {
          setError("Style must have version: 8");
          onOptionsChange(null);
          return;
        }
        setError(null);
        onOptionsChange(trimmed);
      } catch {
        setError("Invalid JSON");
        onOptionsChange(null);
      }
    },
    [onOptionsChange],
  );

  return (
    <Section footer={<Text>Paste a complete MapLibre StyleSpecification</Text>}>
      <TextField
        placeholder='{"version": 8, "sources": {}, "layers": []}'
        defaultValue={existing}
        onChangeText={handleChange}
        multiline
        numberOfLines={8}
        autocorrection={false}
        modifiers={[frame({ minHeight: 160, alignment: "topLeading" })]}
      />
      {error ? (
        <Text modifiers={[foregroundStyle(theme.danger)]}>{error}</Text>
      ) : null}
    </Section>
  );
}

function MBTilesForm({
  options,
  onOptionsChange,
  onNameSuggestion,
}: OptionsFormProps) {
  const theme = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  const existing: MBTilesOptions | null = options
    ? (JSON.parse(options) as MBTilesOptions)
    : null;

  const handlePick = useCallback(async () => {
    setError(null);
    setImporting(true);
    try {
      // MBTiles files have no system MIME type. We register a UTI for the
      // .mbtiles extension in app.json (UTImportedTypeDeclarations); passing
      // no MIME type here means the picker uses UTType.item, which now
      // matches our declared UTI so .mbtiles files are selectable.
      const picked = await File.pickFileAsync();
      const source = Array.isArray(picked) ? picked[0] : picked;
      if (!source) {
        setImporting(false);
        return;
      }
      if (!source.name.toLowerCase().endsWith(".mbtiles")) {
        setError("File must have a .mbtiles extension");
        setImporting(false);
        return;
      }
      const { options: imported, metadata } = await importMBTilesFile(
        source.uri,
      );
      onOptionsChange(JSON.stringify(imported));
      if (metadata.name && onNameSuggestion) {
        onNameSuggestion(metadata.name);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to import MBTiles file");
    } finally {
      setImporting(false);
    }
  }, [onOptionsChange, onNameSuggestion]);

  return (
    <>
      <Section
        footer={
          <Text>
            Select a local .mbtiles file. It will be copied into the app.
          </Text>
        }
      >
        <Button
          systemImage={
            existing ? "arrow.triangle.2.circlepath" : "square.and.arrow.down"
          }
          label={
            importing ? "Importing…" : existing ? "Replace file" : "Choose file…"
          }
          onPress={handlePick}
          modifiers={[disabled(importing)]}
        />
      </Section>

      {existing ? (
        <Section>
          <Text>Format: {existing.format}</Text>
          {existing.minZoom != null && existing.maxZoom != null ? (
            <Text>
              Zoom: {existing.minZoom}–{existing.maxZoom}
            </Text>
          ) : null}
          {existing.bounds ? (
            <Text>
              Bounds: {existing.bounds.map((n) => n.toFixed(3)).join(", ")}
            </Text>
          ) : null}
          {existing.attribution ? (
            <Text>Attribution: {existing.attribution}</Text>
          ) : null}
        </Section>
      ) : null}

      {error ? (
        <Section>
          <Text modifiers={[foregroundStyle(theme.danger)]}>{error}</Text>
        </Section>
      ) : null}
    </>
  );
}

export const FORM_COMPONENTS: Record<
  FormType,
  React.ComponentType<OptionsFormProps>
> = {
  style: StyleUrlForm,
  raster: RasterForm,
  mbtiles: MBTilesForm,
  custom: CustomForm,
};
