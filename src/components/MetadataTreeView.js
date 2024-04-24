import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

const MetadataTreeView = (props) => {
    const { data, expanded } = props;
  
    const renderTree = (nodes) => {
      if (!nodes || nodes.length === 0) {
        return null;
      }
      return (
        <>
        {Array.isArray(nodes) ?
            nodes.map ((node) => {
                return (
                    <TreeItem itemId={'category'+node.categoryId} label={node.name}>
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
      >
        {renderTree(data)}
      </SimpleTreeView>
    );
  };
  
  export default MetadataTreeView;