import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Typography } from '@mui/material';
import { Col, Row } from 'react-bootstrap';

const MetadataTreeView = (props) => {
    const { data, expanded } = props;

    const editCategory = (e, node) => {
        e.stopPropagation();
        props.edit && props.edit (node);
    }

    const deleteCategory = (e, node) => {
        e.stopPropagation();
        props.delete && props.delete (node);
    }
  
    const renderTree = (nodes) => {
      if (!nodes || nodes.length === 0) {
        return null;
      }
      return (
        <>
        {Array.isArray(nodes) ?
            nodes.map ((node) => {
                return (
                    <TreeItem itemId={'category'+node.categoryId} label=
                        {
                            <Row>
                              <Col style={{display:'flex', marginTop:'7px'}}>
                              <Typography variant="body2">
                                {node.name}
                              </Typography>
                              </Col>
                              <Col style={{display:'flex', justifyContent:'right', marginRight: '50px'}}>
                                {props.edit && (
                              <IconButton color="primary" onClick={(event) => editCategory(event, node)}>
                                <EditIcon />
                              </IconButton>)}
                              {props.delete && (
                              <IconButton color="error" onClick={(event) => deleteCategory(event, node)}>
                                <DeleteIcon />
                              </IconButton>)}
                              </Col>
                            </Row>
                          }
                    >
                    {Array.isArray(node.dataTypes)
                        ? node.dataTypes.map ((datatype) => renderDatatypes(datatype))
                        : null}
                    </TreeItem>
                )
            }) : null
        }
        </>
      );
    };

    const renderDatatypes = (node) => {
        if (!node || node.length === 0) {
            return null;
        }

        return (
            <TreeItem itemId={node.datatypeId} label={node.name}>
            </TreeItem>
        );
    };
  
    return (
      <SimpleTreeView
        expanded={expanded}
        onItemSelectionToggle={props.onItemSelectionToggle}
      >
        {renderTree(data)}
      </SimpleTreeView>
    );
  };
  
  export default MetadataTreeView;