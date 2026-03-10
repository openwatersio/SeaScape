import { usePreferredUnits } from '@/hooks/usePreferredUnits';

const initialState = usePreferredUnits.getState();

beforeEach(() => {
  usePreferredUnits.setState(initialState, true);
});

describe('usePreferredUnits', () => {
  it('defaults to knots', () => {
    expect(usePreferredUnits.getState().speed).toBe('knot');
  });

  describe('toSpeed', () => {
    it('converts m/s to knots', () => {
      const result = usePreferredUnits.getState().toSpeed(1);
      expect(result.value).toBe('1.9'); // 1 m/s ≈ 1.944 knots
      expect(result.abbr).toBe('knot');
    });

    it('converts zero correctly', () => {
      const result = usePreferredUnits.getState().toSpeed(0);
      expect(result.value).toBe('0.0');
    });

    it('respects the decimals option', () => {
      const result = usePreferredUnits.getState().toSpeed(1, { decimals: 2 });
      expect(result.value).toBe('1.94');
    });

    it('uses the preferred unit after set()', () => {
      usePreferredUnits.getState().set({ speed: 'km/h' });
      const result = usePreferredUnits.getState().toSpeed(1);
      expect(result.value).toBe('3.6'); // 1 m/s = 3.6 km/h
      expect(result.abbr).toBe('km/h');
    });
  });

  describe('possibilities', () => {
    it('returns available speed units including knot', () => {
      const units = usePreferredUnits.getState().possibilities('speed');
      expect(units).toContain('knot');
      expect(units).toContain('km/h');
      expect(units).toContain('m/s');
    });
  });

  describe('describe', () => {
    it('returns description for knot', () => {
      const desc = usePreferredUnits.getState().describe('knot');
      expect(desc.abbr).toBe('knot');
      expect(desc.singular).toBeTruthy();
    });
  });
});
