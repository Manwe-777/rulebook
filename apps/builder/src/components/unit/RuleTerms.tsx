import type { Library } from '@rulebook/rules';
import { Fragment } from 'react';

import RuleTerm from './RuleTerm';

/** A comma-separated list of rule terms, each opening its explanation. */
export default function RuleTerms({ library, terms }: { library: Library; terms: string[] }) {
  return terms.map((term, i) => (
    <Fragment key={term}>
      {i > 0 && ', '}
      <RuleTerm library={library} term={term} />
    </Fragment>
  ));
}
