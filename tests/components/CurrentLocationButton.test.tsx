import { fireEvent, render, screen } from '@testing-library/react-native';
import CurrentLocationButton from '@/components/CurrentLocationButton';
import { useCameraState } from '@/hooks/useCameraState';

const initialState = useCameraState.getState();

beforeEach(() => {
  useCameraState.setState(initialState, true);
});

describe('CurrentLocationButton', () => {
  it('shows my-location icon when following user', () => {
    useCameraState.setState({ followUserLocation: true });
    render(<CurrentLocationButton />);
    expect(screen.getByTestId('symbol-location.fill')).toBeTruthy();
  });

  it('shows location-searching icon when not following user', () => {
    useCameraState.setState({ followUserLocation: false });
    render(<CurrentLocationButton />);
    expect(screen.getByTestId('symbol-location')).toBeTruthy();
  });

  it('sets followUserLocation to true when pressed', () => {
    useCameraState.setState({ followUserLocation: false });
    render(<CurrentLocationButton />);
    fireEvent.press(screen.getByTestId('symbol-location').parent!);
    expect(useCameraState.getState().followUserLocation).toBe(true);
  });
});
