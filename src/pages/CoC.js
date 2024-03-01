import { useEffect, useMemo, useReducer} from "react";
import { Container } from "@mui/material";
import { PageHeading } from "../components/FormControls";
import DialogAlert from "../components/DialogAlert";
import { Button, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import stringConstants from '../data/stringConstants.json';
import Table from "../components/Table";

const CoC = (props) => {

  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  let navigate = useNavigate();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(props.authCheckAgent, []);

  const getGlycanCount = (collections) => {
    let count = 0;
    collections.forEach(element => {
        if (element.glycans) {
            count += element.glycans.length;
        } 
    });
    return count;
  }

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name', 
        header: 'Name',
        size: 50,
      },
      {
        accessorKey: 'children.length',
        header: '# Collections',
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
              title="Your Collections of Collections"
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
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                    onClick={()=> navigate(stringConstants.routes.addcoc)}>
                Add
                </Button>
              </div>
              <Table 
                  authCheckAgent={props.authCheckAgent}
                  ws="api/data/getcoss"
                  columns={columns}
                  enableRowActions={true}
                  setAlertDialogInput={setAlertDialogInput}
                  showEdit={true}
                  edit={stringConstants.routes.addcoc + "?cocId="}
                  deletews="api/data/deletecoc/"
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

export default CoC;