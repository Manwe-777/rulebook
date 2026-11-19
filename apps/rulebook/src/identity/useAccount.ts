import { useContext } from 'react';

import { type Account, AccountContext } from './AccountContext';

export function useAccount(): Account {
  const account = useContext(AccountContext);

  if (!account) throw new Error('useAccount needs an AccountProvider');

  return account;
}
