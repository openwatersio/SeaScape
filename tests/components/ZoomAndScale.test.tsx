import { fireEvent, render, screen } from '@testing-library/react-native';
import ZoomAndScale from '@/components/ZoomAndScale';
import { useCameraState } from '@/hooks/useCameraState';

const initialState = useCameraState.getState();

beforeEach(() => {
  useCameraState.setState(initialState, true);
});

describe('ZoomAndScale', () => {
  it('calls zoomIn when the + button is pressed', () => {
    useCameraState.setState({ zoom: 10 });
    render(<ZoomAndScale />);
    fireEvent.press(screen.getByTestId('symbol-plus').parent!);
    expect(useCameraState.getState().zoom).toBe(11);
  });

  it('calls zoomOut when the - button is pressed', () => {
    useCameraState.setState({ zoom: 10 });
    render(<ZoomAndScale />);
    fireEvent.press(screen.getByTestId('symbol-minus').parent!);
    expect(useCameraState.getState().zoom).toBe(9);
  });
});
