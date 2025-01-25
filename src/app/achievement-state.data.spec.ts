import { AchievementState } from './achievement-state.data';

describe('AchievementState', () => {
  it('should create an instance', () => {
    expect(new AchievementState(10, 11, 100005)).toBeTruthy();
  });
});
