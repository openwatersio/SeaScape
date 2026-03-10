import { fireEvent, render, screen } from '@testing-library/react-native';
import OverlayButton from '@/components/ui/OverlayButton';

describe('OverlayButton', () => {
  describe('with href', () => {
    it('renders as a Link', () => {
      render(<OverlayButton href="/ViewOptions" icon="layers" />);
      expect(screen.getByTestId('link-/ViewOptions')).toBeTruthy();
    });
  });

  describe('without href', () => {
    it('renders as a Pressable', () => {
      const onPress = jest.fn();
      render(<OverlayButton onPress={onPress} icon="zoom-in" testID="btn" />);
      fireEvent.press(screen.getByTestId('btn'));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });
});
