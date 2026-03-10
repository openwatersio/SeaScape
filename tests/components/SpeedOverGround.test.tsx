import SpeedOverGround from '@/components/SpeedOverGround';
import { NavigationState, useNavigationState } from '@/hooks/useNavigationState';
import { usePreferredUnits } from '@/hooks/usePreferredUnits';
import { render, screen } from '@testing-library/react-native';

const initialNavState = useNavigationState.getState();
const initialUnitsState = usePreferredUnits.getState();

beforeEach(() => {
  useNavigationState.setState(initialNavState, true);
  usePreferredUnits.setState(initialUnitsState, true);
});

describe('SpeedOverGround', () => {
  it('renders the SOG label', () => {
    render(<SpeedOverGround />);
    expect(screen.getByText('SOG')).toBeTruthy();
  });

  it('shows "0.0" when no GPS speed is available', () => {
    render(<SpeedOverGround />);
    expect(screen.getByText('0.0')).toBeTruthy();
  });

  it('is hidden when moored', () => {
    useNavigationState.setState({ state: NavigationState.Moored });
    // The container View has opacity: 0 when moored
    const root = render(<SpeedOverGround />).toJSON();
    const opacity = [root.props.style].flat().find((s: any) => s?.opacity !== undefined)?.opacity;
    expect(opacity).toBe(0);
  });

  it('is visible when underway', () => {
    useNavigationState.setState({ state: NavigationState.Underway });
    const { toJSON } = render(<SpeedOverGround />);
    const root = toJSON() as any;
    const opacity = [root.props.style].flat().find((s: any) => s?.opacity !== undefined)?.opacity;
    expect(opacity).toBe(1);
  });

  it('converts speed to the preferred unit', () => {
    useNavigationState.setState({ state: NavigationState.Underway, coords: { speed: 1 } as any });
    render(<SpeedOverGround />);
    // 1 m/s ≈ 1.9 knots (default unit)
    expect(screen.getByText('1.9')).toBeTruthy();
  });
});
