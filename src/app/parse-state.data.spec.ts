import { ParseState } from './parse-state.data';

describe('ParseState', () => {
  it('should create an instance', () => {
    expect(new ParseState("General","Class")).toBeTruthy();
  });
});
