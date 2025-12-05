import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Alert,
    Snackbar,
    Paper,
    Chip,
    IconButton,
    Tooltip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    CircularProgress,
} from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import {
    LocalShipping as ShippingIcon,
    CheckCircle as DeliveredIcon,
    Schedule as PendingIcon,
    FastForward as AdvanceIcon,
    Visibility as ViewIcon,
    LocalShipping as DeliveryIcon,
    Refresh as RefreshIcon,
    Add as AddIcon,
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { useParceletContext } from '../context/ParceletContext';
import { deliveryGatewayClient } from '../services/deliveryGatewayClient';
import { CreateShipmentRequest } from '../types/delivery';
import CreateShipmentDialog from './CreateShipmentDialog';

interface Parcelet {
    id: number;
    order_id: number;
    customer_name: string;
    customer_email: string;
    product_name: string;
    quantity: number;
    shipping_address: string;
    tracking_number: string;
    status: 'pending' | 'ready_for_pickup' | 'delivered';
    notes?: string;
    created_at: string;
    updated_at: string;
}

const statusColors = {
    pending: 'warning',
    ready_for_pickup: 'info',
    delivered: 'success',
} as const;

const statusIcons = {
    pending: <PendingIcon />,
    ready_for_pickup: <ShippingIcon />,
    delivered: <DeliveredIcon />,
};

const ParceletsList: React.FC = () => {
    const navigate = useNavigate();
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'warning'
    });

    const [confirmDialog, setConfirmDialog] = useState({
        open: false,
        title: '',
        message: '',
        parceletId: 0,
        action: '' as 'advance' | 'reset'
    });

    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const {
        parcelets,
        isLoading,
        error,
        refreshParcelets,
        updateParcelet,
        resetParcelets,
        isResetting,
        advanceParcelet
    } = useParceletContext();

    const columns: GridColDef[] = [
        {
            field: 'id',
            headerName: 'Parcelet ID',
            width: 130,
            renderCell: (params) => (
                <Box sx={{ fontWeight: 600, color: '#1976d2' }}>
                    #{params.value}
                </Box>
            ),
        },
        {
            field: 'tracking_number',
            headerName: 'Tracking Number',
            width: 180,
            renderCell: (params) => (
                <Box sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#2c3e50',
                }}>
                    {params.value}
                </Box>
            ),
        },
        {
            field: 'customer_name',
            headerName: 'Customer',
            minWidth: 200,
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ lineHeight: 1.3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem', mb: 0.3 }}>
                        {params.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block' }}>
                        {params.row.customer_email}
                    </Typography>
                    <Typography variant="caption" color="primary.main" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                        Order #{params.row.order_id}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'product_name',
            headerName: 'Product',
            minWidth: 200,
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ lineHeight: 1.3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem', mb: 0.3 }}>
                        {params.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        Qty: {params.row.quantity}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Chip
                    icon={statusIcons[params.value as keyof typeof statusIcons]}
                    label={params.value.toUpperCase().replace('_', ' ')}
                    color={statusColors[params.value as keyof typeof statusColors]}
                    size="small"
                    sx={{
                        fontWeight: 600,
                        minWidth: '100px',
                        fontSize: '0.75rem',
                        height: '24px'
                    }}
                />
            ),
        },
        // {
        //     field: 'shipping_address',
        //     headerName: 'Shipping Address',
        //     minWidth: 250,
        //     flex: 1.2,
        //     renderCell: (params) => (
        //         <Tooltip title={params.value} arrow>
        //             <Box sx={{
        //                 fontSize: '0.8rem',
        //                 color: '#6c757d',
        //                 lineHeight: 1.3,
        //                 maxHeight: '2.6em',
        //                 overflow: 'hidden',
        //                 display: '-webkit-box',
        //                 WebkitLineClamp: 2,
        //                 WebkitBoxOrient: 'vertical',
        //             }}>
        //                 {params.value}
        //             </Box>
        //         </Tooltip>
        //     ),
        // },
        {
            field: 'updated_at',
            headerName: 'Last Updated',
            width: 140,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => (
                <Box sx={{ fontSize: '0.75rem', color: '#6c757d', textAlign: 'center', lineHeight: 1.2 }}>
                    <Typography variant="caption" sx={{ display: 'block', fontSize: '0.75rem', mb: 0.2 }}>
                        {new Date(params.value).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                        {new Date(params.value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 120,
            align: 'center',
            headerAlign: 'center',
            getActions: (params) => {
                const actions = [
                    <GridActionsCellItem
                        icon={<ViewIcon sx={{ fontSize: '1.1rem' }} />}
                        label="View Details"
                        onClick={() => handleViewDetails(params.row)}
                        color="primary"
                        size="small"
                        sx={{
                            '&:hover': { backgroundColor: '#e3f2fd' },
                            padding: '4px',
                        }}
                    />,
                ];

                if (params.row.status !== 'delivered') {
                    actions.push(
                        <GridActionsCellItem
                            icon={<AdvanceIcon sx={{ fontSize: '1.1rem' }} />}
                            label="Advance Status"
                            onClick={() => handleAdvanceStatus(params.row.id)}
                            color="success"
                            size="small"
                            disabled={advanceMutation.isPending}
                            sx={{
                                '&:hover': { backgroundColor: '#e8f5e8' },
                                padding: '4px',
                            }}
                        />
                    );
                }

                return actions;
            },
        },
    ];

    const advanceMutation = useMutation({
        mutationFn: async (parceletId: number) => {
            return await advanceParcelet(parceletId);
        },
        onSuccess: async (data) => {
            const newStatus = data.status;
            setSnackbar({
                open: true,
                message: `Parcelet #${data.id} advanced to ${newStatus.toUpperCase().replace('_', ' ')}!`,
                severity: 'success'
            });
            // No page reload - advanceParcelet already updates local state optimistically
        },
        onError: (error: any) => {
            const errorMessage = error.message || 'Failed to advance parcelet status';
            setSnackbar({
                open: true,
                message: `Error: ${errorMessage}`,
                severity: 'error'
            });
        },
    });

    const createShipmentMutation = useMutation({
        mutationFn: async (shipmentData: CreateShipmentRequest) => {
            return await deliveryGatewayClient.createShipment(shipmentData);
        },
        onSuccess: async (data) => {
            setSnackbar({
                open: true,
                message: `Shipment created successfully! Order: ${data.orderId}`,
                severity: 'success'
            });

            await refreshParcelets();
        },
        onError: (error: any) => {
            const errorMessage = error.message || 'Failed to create shipment';
            setSnackbar({
                open: true,
                message: `Error creating shipment: ${errorMessage}`,
                severity: 'error'
            });
        },
    });

    const handleConfirmAdvance = () => {
        setConfirmDialog({ ...confirmDialog, open: false });
        if (confirmDialog.action === 'advance') {
            advanceMutation.mutate(confirmDialog.parceletId);
        } else if (confirmDialog.action === 'reset') {
            handleResetConfirmed();
        }
    };

    const handleCancelAdvance = () => {
        setConfirmDialog({ ...confirmDialog, open: false });
    };

    const handleResetClick = () => {
        setConfirmDialog({
            open: true,
            title: 'Refresh Delivery Data',
            message: 'This will reload fresh data from the delivery gateway.',
            parceletId: 0,
            action: 'reset'
        });
    };

    const handleResetConfirmed = async () => {
        try {
            await resetParcelets();
            setSnackbar({
                open: true,
                message: 'Delivery data has been refreshed successfully!',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: `Error refreshing data: ${error instanceof Error ? error.message : 'Gateway service may not be running'}`,
                severity: 'error'
            });
        }
    };

    const handleAdvanceStatus = (parceletId: number) => {
        const parcelet = parcelets.find((p: Parcelet) => p.id === parceletId);
        if (!parcelet) return;

        let nextStatus: string;
        switch (parcelet.status) {
            case 'pending':
                nextStatus = 'READY FOR PICKUP';
                break;
            case 'ready_for_pickup':
                nextStatus = 'DELIVERED';
                break;
            default:
                return;
        }

        const confirmMessage = `Are you sure you want to advance parcelet #${parceletId} from ${parcelet.status.toUpperCase().replace('_', ' ')} to ${nextStatus} status?`;

        setConfirmDialog({
            open: true,
            title: `Advance Parcelet #${parceletId}`,
            message: confirmMessage,
            parceletId: parceletId,
            action: 'advance'
        });
    };

    const handleViewDetails = (parcelet: Parcelet) => {
        // Navigate with clean URL using only the ID
        navigate(`/parcelet-details/${parcelet.id}`);
    };

    const statusCounts = parcelets.reduce((acc: any, parcelet: Parcelet) => {
        acc[parcelet.status] = (acc[parcelet.status] || 0) + 1;
        return acc;
    }, {});

    if (isLoading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Typography variant="h4">Loading parcelets...</Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <DeliveryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                        <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
                            Delivery Management
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<RefreshIcon />}
                        onClick={refreshParcelets}
                        disabled={isLoading}
                    >
                        Retry
                    </Button>
                </Box>
                <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Cannot connect to delivery gateway
                    </Typography>
                    <Typography>
                        {error instanceof Error ? error.message : 'Unknown error occurred'}
                    </Typography>
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <DeliveryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
                        Delivery Management
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                        disabled={isLoading}
                        sx={{ minWidth: '150px' }}
                    >
                        Create Shipment
                    </Button>

                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={isResetting ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
                        onClick={handleResetClick}
                        disabled={isLoading || isResetting}
                        sx={{ minWidth: '120px' }}
                    >
                        {isResetting ? 'Refreshing...' : 'Refresh Data'}
                    </Button>
                </Box>
            </Box>

            {/* Status Summary Cards */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                        <PendingIcon color="warning" />
                        <Typography variant="h6" color="warning.main">Pending</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {statusCounts.pending || 0}
                    </Typography>
                </Paper>

                <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                        <ShippingIcon color="info" />
                        <Typography variant="h6" color="info.main">Ready for Pickup</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {statusCounts.ready_for_pickup || 0}
                    </Typography>
                </Paper>

                <Paper sx={{ p: 2, flex: 1, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                        <DeliveredIcon color="success" />
                        <Typography variant="h6" color="success.main">Delivered</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {statusCounts.delivered || 0}
                    </Typography>
                </Paper>
            </Box>

            <Paper sx={{ height: 500, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                <DataGrid
                    rows={parcelets}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 20 },
                        },
                    }}
                    pageSizeOptions={[15, 20, 25, 50]}
                    checkboxSelection
                    disableRowSelectionOnClick
                    rowHeight={70}
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-root': {
                            border: 'none',
                        },
                        '& .MuiDataGrid-cell': {
                            paddingLeft: '12px',
                            paddingRight: '12px',
                            paddingTop: '4px',
                            paddingBottom: '4px',
                            borderBottom: '1px solid #f0f0f0',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                        },
                        '& .MuiDataGrid-columnHeader': {
                            paddingLeft: '5px',
                            paddingRight: '12px',
                            paddingTop: '12px',
                            paddingBottom: '12px',
                            backgroundColor: 'rgba(250, 248, 248, 1)',
                            borderBottom: '2px solid #e9ecef',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#495057',
                        },
                        '& .MuiDataGrid-row': {
                            '&:hover': {
                                backgroundColor: '#f8f9fa',
                                cursor: 'pointer',
                            },
                            '&.Mui-selected': {
                                backgroundColor: '#e3f2fd',
                                '&:hover': {
                                    backgroundColor: '#bbdefb',
                                },
                            },
                        },
                        '& .MuiDataGrid-cell:focus': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-columnHeader:focus': {
                            outline: 'none',
                        },
                        '& .MuiDataGrid-footerContainer': {
                            borderTop: '2px solid #e9ecef',
                            backgroundColor: '#f8f9fa',
                            minHeight: '48px',
                        },
                        '& .MuiDataGrid-virtualScroller': {
                            backgroundColor: '#fff',
                        },
                        '& .MuiDataGrid-actionsCell': {
                            gap: '4px',
                        },
                    }}
                />
            </Paper>

            {parcelets.length === 0 && !isLoading && (
                <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
                    <DeliveryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                        No data available
                    </Typography>
                    <Typography color="text.secondary">
                        No shipments found in the delivery gateway. Make sure the gateway service is running and contains shipment data.
                    </Typography>
                </Paper>
            )}

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={handleCancelAdvance}
            >
                <DialogTitle>
                    {confirmDialog.title}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirmDialog.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelAdvance} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmAdvance}
                        color="primary"
                        variant="contained"
                        autoFocus
                    >
                        {confirmDialog.action === 'reset' ? 'Refresh' : 'Confirm'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Create Shipment Dialog */}
            <CreateShipmentDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSubmit={createShipmentMutation.mutateAsync}
                isLoading={createShipmentMutation.isPending}
            />
        </Container>
    );
};

export default ParceletsList;
