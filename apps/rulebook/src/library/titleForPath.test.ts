import { describe, expect, it } from 'vitest';

import { bundledLibrary as library } from './bundledLibrary';
import { pagePaths } from './pagePaths';
import { titleForPath } from './titleForPath';

describe('titleForPath', () => {
  it('names the unit, its faction and the site', () => {
    expect(titleForPath(library, '/demo-host/line-troopers')).toBe('Line Troopers · Demo Host · Rulebook');
    expect(titleForPath(library, '/demo-host/line-troopers/')).toBe('Line Troopers · Demo Host · Rulebook');
  });

  it('names a detachment page the same way', () => {
    expect(titleForPath(library, '/demo-host/detachment/shield-wall')).toBe('Shield Wall · Demo Host · Rulebook');
  });

  it('a faction page names the faction and the site; the index only the site', () => {
    expect(titleForPath(library, '/demo-host')).toBe('Demo Host · Rulebook');
    expect(titleForPath(library, '/')).toBe('Rulebook');
  });

  it('names the account page and the editing pages', () => {
    expect(titleForPath(library, '/account')).toBe('Account · Rulebook');
    expect(titleForPath(library, '/print')).toBe('Army sheet · Rulebook');
    expect(titleForPath(library, '/demo-host/edit')).toBe('Edit · Demo Host · Rulebook');
    expect(titleForPath(library, '/demo-host/edit/unit/field-captain')).toBe('Edit · Demo Host · Rulebook');
  });

  it('unknown factions, units, detachments and deeper paths say not found', () => {
    expect(titleForPath(library, '/tau')).toBe('Not found · Rulebook');
    expect(titleForPath(library, '/demo-host/grots')).toBe('Not found · Rulebook');
    expect(titleForPath(library, '/demo-host/detachment/nope')).toBe('Not found · Rulebook');
    expect(titleForPath(library, '/demo-host/line-troopers/extra')).toBe('Not found · Rulebook');
  });
});

describe('pagePaths', () => {
  it('has the index, each faction, unit and detachment, and every one has a title', () => {
    const paths = pagePaths(library);

    expect(paths).toContain('/');
    expect(paths).toContain('/demo-host');
    expect(paths).toContain('/demo-host/field-captain');
    expect(paths).toContain('/demo-host/detachment/shield-wall');
    expect(paths.filter((p) => titleForPath(library, p).startsWith('Not found'))).toEqual([]);
  });
});
