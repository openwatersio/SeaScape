import { render, screen } from '@testing-library/react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

describe('IconSymbol', () => {
  it.each([
    ['layers', 'square.3.layers.3d'],
    ['my-location', 'location.fill'],
    ['location-searching', 'location'],
    ['zoom-in', 'plus'],
    ['zoom-out', 'minus'],
  ] as const)('maps "%s" to SF Symbol "%s"', (icon, sfSymbol) => {
    render(<IconSymbol name={icon} />);
    expect(screen.getByTestId(`symbol-${sfSymbol}`)).toBeTruthy();
  });
});
