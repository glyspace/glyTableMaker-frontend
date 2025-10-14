import identifierMap from '../data/datasetidentifermap.json';


import { useParams, Navigate } from 'react-router-dom';

const OldPublicDataset = () => {
   let { datasetId } = useParams();

  const newId = identifierMap[datasetId];

  if (!newId) {
    return <div style={{margin: '30px'}}>Dataset {datasetId} not found</div>;
  } else {
    return <Navigate to={`/data/${newId}`} replace/>
  }
} 
export { OldPublicDataset } 
