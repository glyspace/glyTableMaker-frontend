import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { Box, IconButton, Tooltip, Typography } from '@mui/material';
import { Col, Row } from 'react-bootstrap';
import { AddCircleOutline, PlusOne, TextIncrease } from '@mui/icons-material';

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

    const deleteDatatype = (e, node) => {
        e.stopPropagation();
        props.deleteDatatype && props.deleteDatatype (node);
    }

    const addDatatype = (e, node) => {
        e.stopPropagation();
        props.add && props.add(node);
    }

    const editDatatype = (e, node, parent, readOnly) => {
      e.stopPropagation();
      props.editDatatype && props.editDatatype(node, parent, readOnly);
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
                              {props.delete && !node.name.includes ("GlyGen Glycomics Data") && (
                                <Tooltip title="Delete category">
                              <IconButton color="error" onClick={(event) => deleteCategory(event, node)}>
                                <DeleteIcon />
                              </IconButton></Tooltip>)}
                              {props.edit && !node.name.includes ("GlyGen Glycomics Data") && (
                                    <Tooltip title="Edit category">
                              <IconButton color="primary" onClick={(event) => editCategory(event, node)}>
                                <EditIcon />
                              </IconButton>
                              </Tooltip>)}
                              {props.add && !node.name.includes ("GlyGen Glycomics Data") && (
                                <Tooltip title="Add datatype">
                              <IconButton color="primary" onClick={(event) => addDatatype(event, node)}>
                                <AddCircleOutline />
                              </IconButton></Tooltip>)}
                              
                              </Col>
                            </Row>
                          }
                    >
                    {Array.isArray(node.dataTypes)
                        ? node.dataTypes.map ((datatype) => renderDatatypes(datatype, node, node.name.includes ("GlyGen Glycomics Data")))
                        : null}
                    </TreeItem>
                )
            }) : null
        }
        </>
      );
    };

    const renderDatatypes = (node, parent, readOnly) => {
        if (!node || node.length === 0) {
            return null;
        }

        return (
            <TreeItem itemId={node.datatypeId} label=
            {
                <Row>
                    <Col style={{display:'flex', marginTop:'7px'}}>
                    <Typography variant="body2">
                    {node.mandatory ? <Box component="span" fontWeight='fontWeightBold'>{node.name}</Box> : node.name}
                    </Typography>
                    </Col>
                    <Col style={{display:'flex', justifyContent:'right', marginRight: '50px'}}>
                    {props.deleteDatatype && !readOnly && (
                        <Tooltip title="Delete datatype">
                    <IconButton color="error" onClick={(event) => deleteDatatype(event, node)}>
                        <DeleteIcon />
                    </IconButton></Tooltip>)}
                    {props.editDatatype && !readOnly && (
                        <Tooltip title="Edit datatype">
                    <IconButton color="primary" onClick={(event) => editDatatype(event, node, parent, false)}>
                        <EditIcon />
                    </IconButton></Tooltip>)}
                    {props.editDatatype && readOnly && (
                        <Tooltip title="View datatype">
                    <IconButton color="primary" onClick={(event) => editDatatype(event, node, parent, true)}>
                        <VisibilityOutlinedIcon />
                    </IconButton></Tooltip>)}
                    {/**  props.checkboxSelection && node.multiple && (
                      <IconButton color="primary" onClick={(event) => props.addItemToSelection(node)}>
                      <PlusOne />
                    </IconButton>
                    )*/}
                    </Col>
                </Row>
            }>
            </TreeItem>
        );
    };
  
    return (
      
      <SimpleTreeView multiSelect={props.checkboxSelection ? true: false} 
        checkboxSelection={props.checkboxSelection ? true: false}
        expanded={expanded}
        onItemSelectionToggle={props.onItemSelectionToggle ? props.onItemSelectionToggle : ()=> {}}
        onSelectedItemsChange={props.onSelectedItemsChange}
        selectedItems={props.selectedItems}
      >
        {renderTree(data)}
      </SimpleTreeView>
    );
  };
  
  export default MetadataTreeView;