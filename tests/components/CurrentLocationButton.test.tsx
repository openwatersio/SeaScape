import { fireEvent, render, screen } from '@testing-library/react-native';
import CurrentLocationButton from '@/components/CurrentLocationButton';
import { useCameraState } from '@/hooks/useCameraState';

const initialState = useCameraState.getState();

beforeEach(() => {
  useCameraState.setState(initialState, true);
});

describe('CurrentLocationButton', () => {
  it('shows location-searching icon when not following', () => {
    useCameraState.setState({ followUserLocation: false });
    render(<CurrentLocationButton />);
    expect(screen.getByTestId('symbol-location')).toBeTruthy();
  });

  it('shows my-location icon when following north-up', () => {
    useCameraState.setState({ followUserLocation: true, orientationMode: 'north' });
    render(<CurrentLocationButton />);
    expect(screen.getByTestId('symbol-location.fill')).toBeTruthy();
  });

  it('shows compass dial when following course-up', () => {
    useCameraState.setState({ followUserLocation: true, orientationMode: 'course' });
    render(<CurrentLocationButton />);
    expect(screen.getByText('N')).toBeTruthy();
  });

  it('cycles from not-following to following north-up', () => {
    useCameraState.setState({ followUserLocation: false });
    render(<CurrentLocationButton />);
    fireEvent.press(screen.getByTestId('symbol-location').parent!);
    expect(useCameraState.getState().followUserLocation).toBe(true);
    expect(useCameraState.getState().orientationMode).toBe('north');
  });

  it('cycles from north-up to course-up', () => {
    useCameraState.setState({ followUserLocation: true, orientationMode: 'north' });
    render(<CurrentLocationButton />);
    fireEvent.press(screen.getByTestId('symbol-location.fill').parent!);
    expect(useCameraState.getState().orientationMode).toBe('course');
  });

  it('cycles from course-up to north-up', () => {
    useCameraState.setState({ followUserLocation: true, orientationMode: 'course', bearing: 45 });
    render(<CurrentLocationButton />);
    fireEvent.press(screen.getByText('N').parent!.parent!);
    expect(useCameraState.getState().orientationMode).toBe('north');
    expect(useCameraState.getState().bearing).toBe(0);
  });
});
