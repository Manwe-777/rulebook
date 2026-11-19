import { useParams } from 'react-router';

import { useLibrary } from '../../hooks/useLibrary';
import Breadcrumbs from '../common/Breadcrumbs';
import Datasheet from '../datasheet/Datasheet';
import NotFoundPage from './NotFoundPage';

export default function UnitPage() {
  const { faction: factionId = '', unit: unitId = '' } = useParams();
  const found = useLibrary().unit(factionId, unitId);

  if (!found) return <NotFoundPage />;

  return (
    <div className="flex flex-col gap-3">
      <Breadcrumbs faction={found.faction} />
      <Datasheet unit={found.unit} faction={found.faction} />
    </div>
  );
}
