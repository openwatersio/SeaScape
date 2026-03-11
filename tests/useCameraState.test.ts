import { useCameraState } from '@/hooks/useCameraState';

const initialState = useCameraState.getState();

beforeEach(() => {
  useCameraState.setState(initialState, true);
});

describe('useCameraState', () => {
  it('has correct initial state', () => {
    const { followUserLocation, zoom, center } = useCameraState.getState();
    expect(followUserLocation).toBe(true);
    expect(zoom).toBeUndefined();
    expect(center).toBeUndefined();
  });

  describe('setFollowUserLocation', () => {
    it('sets followUserLocation to false', () => {
      useCameraState.getState().setFollowUserLocation(false);
      expect(useCameraState.getState().followUserLocation).toBe(false);
    });

    it('sets followUserLocation to true', () => {
      useCameraState.setState({ followUserLocation: false });
      useCameraState.getState().setFollowUserLocation(true);
      expect(useCameraState.getState().followUserLocation).toBe(true);
    });
  });

  describe('zoomIn', () => {
    it('increments zoom from undefined (treats as 0)', () => {
      useCameraState.getState().zoomIn();
      expect(useCameraState.getState().zoom).toBe(1);
    });

    it('increments zoom from a known value', () => {
      useCameraState.setState({ zoom: 10 });
      useCameraState.getState().zoomIn();
      expect(useCameraState.getState().zoom).toBe(11);
    });
  });

  describe('zoomOut', () => {
    it('decrements zoom from undefined (treats as 0)', () => {
      useCameraState.getState().zoomOut();
      expect(useCameraState.getState().zoom).toBe(-1);
    });

    it('decrements zoom from a known value', () => {
      useCameraState.setState({ zoom: 10 });
      useCameraState.getState().zoomOut();
      expect(useCameraState.getState().zoom).toBe(9);
    });
  });

  describe('didChange', () => {
    it('updates zoom and center when userInteraction is true', () => {
      const center = [-122.4, 37.8] as any;
      useCameraState.getState().didChange({ userInteraction: true, zoom: 12, center } as any);
      expect(useCameraState.getState().zoom).toBe(12);
      expect(useCameraState.getState().center).toBe(center);
    });

    it('does not update state when userInteraction is false', () => {
      const center = [-122.4, 37.8] as any;
      useCameraState.getState().didChange({ userInteraction: false, zoom: 12, center } as any);
      expect(useCameraState.getState().zoom).toBeUndefined();
      expect(useCameraState.getState().center).toBeUndefined();
    });
  });

  describe('set', () => {
    it('merges partial state', () => {
      useCameraState.getState().set({ zoom: 7 });
      expect(useCameraState.getState().zoom).toBe(7);
      expect(useCameraState.getState().followUserLocation).toBe(true);
    });
  });
});
