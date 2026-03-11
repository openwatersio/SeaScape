import { useCameraState } from '@/hooks/useCameraState';

const initialState = useCameraState.getState();

beforeEach(() => {
  useCameraState.setState(initialState, true);
});

describe('useCameraState', () => {
  it('has correct initial state', () => {
    const { followUserLocation, zoom, center, orientationMode, bearing } = useCameraState.getState();
    expect(followUserLocation).toBe(true);
    expect(zoom).toBeUndefined();
    expect(center).toBeUndefined();
    expect(orientationMode).toBe("north");
    expect(bearing).toBe(0);
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

    it('resets orientation to north when follow is disabled', () => {
      useCameraState.setState({ followUserLocation: true, orientationMode: "course", bearing: 45 });
      useCameraState.getState().setFollowUserLocation(false);
      expect(useCameraState.getState().followUserLocation).toBe(false);
      expect(useCameraState.getState().orientationMode).toBe("north");
      expect(useCameraState.getState().bearing).toBe(0);
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

  describe('cycleTrackingMode', () => {
    it('enables follow when not following', () => {
      useCameraState.setState({ followUserLocation: false, orientationMode: "north" });
      useCameraState.getState().cycleTrackingMode();
      expect(useCameraState.getState().followUserLocation).toBe(true);
      expect(useCameraState.getState().orientationMode).toBe("north");
    });

    it('switches to course-up when following north-up', () => {
      useCameraState.setState({ followUserLocation: true, orientationMode: "north" });
      useCameraState.getState().cycleTrackingMode();
      expect(useCameraState.getState().orientationMode).toBe("course");
    });

    it('switches to north-up and resets bearing when following course-up', () => {
      useCameraState.setState({ followUserLocation: true, orientationMode: "course", bearing: 45 });
      useCameraState.getState().cycleTrackingMode();
      expect(useCameraState.getState().orientationMode).toBe("north");
      expect(useCameraState.getState().bearing).toBe(0);
    });
  });

  describe('didChange', () => {
    it('updates zoom, center, and bearing when userInteraction is true', () => {
      const center = [-122.4, 37.8] as any;
      useCameraState.getState().didChange({ userInteraction: true, zoom: 12, center, bearing: 90 } as any);
      expect(useCameraState.getState().zoom).toBe(12);
      expect(useCameraState.getState().center).toBe(center);
      expect(useCameraState.getState().bearing).toBe(90);
    });

    it('only updates bearing when userInteraction is false', () => {
      const center = [-122.4, 37.8] as any;
      useCameraState.getState().didChange({ userInteraction: false, zoom: 12, center, bearing: 90 } as any);
      expect(useCameraState.getState().zoom).toBeUndefined();
      expect(useCameraState.getState().center).toBeUndefined();
      expect(useCameraState.getState().bearing).toBe(90);
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
