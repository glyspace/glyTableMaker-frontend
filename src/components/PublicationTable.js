import { useEffect, useMemo, useState } from "react";
import { axiosError } from "../utils/axiosError";
import { MaterialReactTable, MRT_ToggleDensePaddingButton, MRT_ToggleFullScreenButton, MRT_ToggleGlobalFilterButton, useMaterialReactTable } from "material-react-table";
import { Col, Form, Row } from "react-bootstrap";
import { Link } from "react-router-dom";
import { getAuthorizationHeader, getJson } from "../utils/api";
import { Box } from "@mui/material";
import "../pages/PublicDataset.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FormLabel } from "./FormControls";


const PublicationTable = props => {

    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);

    // table data
    const [data, setData] = useState([]);
    //table state
    const [columnFilters, setColumnFilters] = useState(props.columnFilters ?? []);
    const [globalFilter, setGlobalFilter] = useState('');
    const [sorting, setSorting] = useState(props.initialSortColumn ? [{"id":props.initialSortColumn,"desc":false}] : []);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const [sortBy, setSortBy] = useState (props.initialSortColumn ?? "year");
    const [orderBy, setOrderBy] = useState (false);

    useEffect(() => {
        if (props.ws) {
            fetchData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        columnFilters,
        globalFilter,
        pagination.pageIndex,
        pagination.pageSize,
        sorting,
        props.ws,
    ]);

    const fetchData = async () => {
        if (!data.length) {
            setIsLoading(true);
        } else {
            setIsRefetching(true);
        }

        props.authCheckAgent && props.authCheckAgent();

        let searchParams = "start=" + pagination.pageIndex;
        searchParams += "&size=" + pagination.pageSize;
        searchParams += "&filters=" + encodeURI(JSON.stringify(columnFilters ?? []));
        searchParams += "&globalFilter=" + globalFilter ?? '';
        searchParams += '&sorting=' + encodeURI(JSON.stringify(sorting ?? []));

        let url = props.ws;
        if (url.includes("?")) {
            url = url + "&" + searchParams;
        } else {
            url = url + "?" + searchParams;
        }

        getJson (url, getAuthorizationHeader()).then ( (json) => {
            setData(json.data.data.objects);
            setRowCount(json.data.data.totalItems);
            setIsError(false);
            setIsLoading(false);
            setIsRefetching(false);
        }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setIsError(true);
                setErrorMessage(error.response.data.message);
                setIsLoading(false);
                setIsRefetching(false);
                return;
            } else {
                setIsRefetching(false);
                setIsLoading(false);
                axiosError(error, null, props.setAlertDialogInput);
                return;
            }
        });
    };

    const publicationColumns = useMemo(
        () => [
            {
            header: 'Publications',
            Header: ({ column }) => (
                <span style={{fontSize: "1.1rem"}}>
                    {column.columnDef.header} ({rowCount})
                </span> 
            ),
            enableColumnFilter: false,
            enableSorting: false,
            enableHiding: false,
            Cell: ({ row, index }) => (
                <div>
                        <div>
                            <h6 style={{ marginBottom: "3px" }}>
                                <strong>{row.original.title}</strong>
                            </h6>
                            </div>
            
                            <div style={{ textAlign: "left", paddingLeft: "35px" }}>
                            <div>{row.original.authors}</div>
                            <div>
                                {row.original.journal} <span>&nbsp;</span>({row.original.year})
                            </div>
                            <div>
                                <FontAwesomeIcon icon={["fas", "book-open"]} size="sm" title="Book" />
            
                                <span style={{ paddingLeft: "15px" }}>PMID:&nbsp;</span>
                                <a
                                href={`https://pubmed.ncbi.nlm.nih.gov/${row.original.pubmedId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                >
                                {row.original.pubmedId}
                                </a>
                            </div>
                            </div>
                </div>
            ),
            },
        ],
        [rowCount],
    );

    const handleSelectSortBy = e => {
        const selected = e.target.options[e.target.selectedIndex].value;
        setSortBy (selected);
        setSorting ([{id : selected, desc: orderBy}]);
    };

    const getSortToolbar = () => {
        return (
        <Row style={{flex: true}}>
            <Col style={{marginTop: '5px'}} xs={4} lg={4}>
            <span>Order&nbsp;by&nbsp;&nbsp;</span>
            <FontAwesomeIcon
                key={"view"}
                icon={["fas", orderBy ? "caret-up" : "caret-down"]}
                title="Order by"
                alt="Caret Icon"
                onClick={() => {
                    setSorting ([{id : sortBy, desc: !orderBy}]);
                    setOrderBy (!orderBy);
                }}
            />
            </Col>
            <Col>
                <Row>
                    <Col style={{marginTop: '5px'}} xs={5} lg={5}>
                    <span>Sort&nbsp;by&nbsp;&nbsp;</span>
                    </Col>
                    <Col style={{marginTop: '5px'}} xs={7} lg={7}>
                        <Form.Select
                            name={"sortBy"}
                            value={sortBy}
                            onChange={handleSelectSortBy}
                            >
                            <option value="year">Year</option>
                            <option value="title">Title</option>
                            <option value="authors">Authors</option>
                            <option value="pubmedId">PubMed Id</option>
                        </Form.Select>
                    </Col>
                </Row>
            </Col>
        </Row>
        );
    }

    

    const table = useMaterialReactTable({
        columns: publicationColumns,
        data : data,
        getRowId: (row) => row["id"],
        manualFiltering:  true,
        manualPagination: true,
        manualSorting: true,
        enableColumnActions: false,
        initialState: {
            showColumnFilters: false,
        },
        muiToolbarAlertBannerProps: isError
          ? {
              color: 'error',
              children: 
                <div>
                <Row>Error loading data</Row>
                <Row>{errorMessage}</Row>
              </div>,
            }
          : undefined,
        renderToolbarInternalActions: ({ table }) => (
        <Box>
            <MRT_ToggleGlobalFilterButton table={table} />
            <MRT_ToggleDensePaddingButton table={table} />
            <MRT_ToggleFullScreenButton table={table} />
        </Box>
        ),
        renderTopToolbarCustomActions : ({ table }) => (
            getSortToolbar()
        ),
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        rowCount,
        state: {
            columnFilters,
            globalFilter,
            isLoading,
            pagination,
            showAlertBanner: isError,
            showProgressBars: isRefetching,
            sorting,
        },
    });

    return (
        <>
            <MaterialReactTable table={table} />
        </>
    );
}

export {PublicationTable};


