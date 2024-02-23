import { useEffect, useMemo, useReducer} from "react";
import { Container } from "@mui/material";
import { PageHeading } from "../components/FormControls";
import DialogAlert from "../components/DialogAlert";
import { Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import stringConstants from '../data/stringConstants.json';
import Table from "../components/Table";

const Collections = (props) => {

  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  let navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(props.authCheckAgent, []);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name', 
        header: 'Name',
        size: 50,
      },
      {
        accessorKey: 'glycans.length',
        header: '# Glycans',
        size: 30,
        enableColumnFilter: false,
      },
      {
        accessorFn: (row) => row.metadata ? row.metadata.length : 0,
        header: '# Metadata Columns',
        id: 'metadata',
        size: 30,
        enableColumnFilter: false,
      },
    ],
    [],
  );

  return (
    <>
    <Container maxWidth="xl">
        <div className="page-container">
          <PageHeading
              title="Your Collections"
              subTitle="The table below displays a list of all collections that have been created. New collections may be added, old collectionns can be edited, and unused collections can
              be removed."
          />
          <DialogAlert
                alertInput={alertDialogInput}
                setOpen={input => {
                    setAlertDialogInput({ show: input });
                }}
                />
              
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={()=> navigate(stringConstants.routes.addcollection)}>
                Add Collection
                </Button>
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" >
                Add Metadata
                </Button>
              </div>
              <Table 
                  authCheckAgent={props.authCheckAgent}
                  ws="api/data/getcollections"
                  columns={columns}
                  enableRowActions={true}
                  setAlertDialogInput={setAlertDialogInput}
                  showEdit={true}
                  editws={stringConstants.routes.addcollection + "?collectionId="}
                  deletews="api/data/deletecollection/"
                  initialSortColumn="name"
                  rowId="collectionId"
                  detailPanel={true}
            />
            </Card.Body>
          </Card>
       </div>
     </Container>
    </>
  )
}

export default Collections;