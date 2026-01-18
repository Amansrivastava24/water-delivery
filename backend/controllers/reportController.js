const DailyCustomer = require('../models/DailyCustomer');
const DailyDelivery = require('../models/DailyDelivery');
const BulkOrder = require('../models/BulkOrder');

/**
 * @route   GET /api/reports/customer-payments
 * @desc    Get customer payment report
 * @access  Private
 */
exports.getCustomerPaymentReport = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const businessId = req.user.businessId;

        // Build date filter
        let dateFilter = { businessId };
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate) {
                dateFilter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                dateFilter.createdAt.$lte = new Date(endDate);
            }
        }

        const customers = await DailyCustomer.find(dateFilter).sort({ name: 1 });

        const report = customers.map(customer => ({
            id: customer._id,
            name: customer.name,
            phone: customer.phone,
            address: customer.address,
            bottleType: customer.bottleType,
            pricePerBottle: customer.pricePerBottle,
            totalBilled: customer.totalBilled,
            totalPaid: customer.totalPaid,
            pendingBalance: customer.pendingBalance,
            isActive: customer.isActive
        }));

        // Calculate totals
        const totals = {
            totalBilled: report.reduce((sum, c) => sum + c.totalBilled, 0),
            totalPaid: report.reduce((sum, c) => sum + c.totalPaid, 0),
            totalPending: report.reduce((sum, c) => sum + c.pendingBalance, 0)
        };

        res.status(200).json({
            success: true,
            count: report.length,
            totals,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/reports/bulk-orders
 * @desc    Get bulk order report
 * @access  Private
 */
exports.getBulkOrderReport = async (req, res, next) => {
    try {
        const { startDate, endDate, paymentStatus } = req.query;
        const businessId = req.user.businessId;

        // Build query
        let query = { businessId };

        if (paymentStatus) {
            query.paymentStatus = paymentStatus;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        const orders = await BulkOrder.find(query)
            .populate('createdBy', 'name')
            .sort({ createdAt: -1 });

        const report = orders.map(order => ({
            id: order._id,
            customerName: order.customerName,
            phone: order.phone,
            eventType: order.eventType,
            quantity: order.quantity,
            bottleType: order.bottleType,
            pricePerBottle: order.pricePerBottle,
            totalAmount: order.totalAmount,
            paidAmount: order.paidAmount,
            pendingAmount: order.pendingAmount,
            paymentStatus: order.paymentStatus,
            deliveryDates: order.deliveryDates,
            createdAt: order.createdAt,
            createdBy: order.createdBy?.name
        }));

        // Calculate totals
        const totals = {
            totalOrders: report.length,
            totalAmount: report.reduce((sum, o) => sum + o.totalAmount, 0),
            totalPaid: report.reduce((sum, o) => sum + o.paidAmount, 0),
            totalPending: report.reduce((sum, o) => sum + o.pendingAmount, 0)
        };

        res.status(200).json({
            success: true,
            count: report.length,
            totals,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/reports/delivery-summary
 * @desc    Get delivery summary report
 * @access  Private
 */
exports.getDeliverySummary = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const businessId = req.user.businessId;

        // Build query
        let query = { businessId };

        if (startDate || endDate) {
            query.deliveryDate = {};
            if (startDate) {
                query.deliveryDate.$gte = new Date(startDate);
            }
            if (endDate) {
                query.deliveryDate.$lte = new Date(endDate);
            }
        }

        const deliveries = await DailyDelivery.find(query)
            .populate('customerId', 'name phone bottleType')
            .populate('deliveredBy', 'name')
            .sort({ deliveryDate: -1 });

        const report = deliveries.map(delivery => ({
            id: delivery._id,
            customerName: delivery.customerId?.name,
            customerPhone: delivery.customerId?.phone,
            bottleType: delivery.customerId?.bottleType,
            deliveryDate: delivery.deliveryDate,
            quantityDelivered: delivery.quantityDelivered,
            amountBilled: delivery.amountBilled,
            isPaid: delivery.isPaid,
            paidAmount: delivery.paidAmount,
            deliveredBy: delivery.deliveredBy?.name,
            notes: delivery.notes
        }));

        // Calculate totals
        const totals = {
            totalDeliveries: report.length,
            totalQuantity: report.reduce((sum, d) => sum + d.quantityDelivered, 0),
            totalBilled: report.reduce((sum, d) => sum + d.amountBilled, 0),
            totalPaid: report.reduce((sum, d) => sum + d.paidAmount, 0)
        };

        res.status(200).json({
            success: true,
            count: report.length,
            totals,
            data: report
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/reports/export
 * @desc    Export report data as CSV
 * @access  Private
 */
exports.exportToCSV = async (req, res, next) => {
    try {
        const { type, startDate, endDate } = req.query;

        if (!type) {
            return res.status(400).json({
                success: false,
                message: 'Report type is required (customers, bulk-orders, deliveries)'
            });
        }

        let csvData = '';
        let filename = '';

        if (type === 'customers') {
            const customers = await DailyCustomer.find({ businessId: req.user.businessId });

            csvData = 'Name,Phone,Address,Bottle Type,Price Per Bottle,Total Billed,Total Paid,Pending Balance,Status\n';
            customers.forEach(c => {
                csvData += `"${c.name}","${c.phone}","${c.address}","${c.bottleType}",${c.pricePerBottle},${c.totalBilled},${c.totalPaid},${c.pendingBalance},"${c.isActive ? 'Active' : 'Inactive'}"\n`;
            });

            filename = `customers_${Date.now()}.csv`;
        }
        else if (type === 'bulk-orders') {
            let query = { businessId: req.user.businessId };
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            const orders = await BulkOrder.find(query);

            csvData = 'Customer Name,Phone,Event Type,Quantity,Bottle Type,Price Per Bottle,Total Amount,Paid Amount,Pending Amount,Payment Status,Created Date\n';
            orders.forEach(o => {
                csvData += `"${o.customerName}","${o.phone}","${o.eventType}",${o.quantity},"${o.bottleType}",${o.pricePerBottle},${o.totalAmount},${o.paidAmount},${o.pendingAmount},"${o.paymentStatus}","${o.createdAt.toISOString().split('T')[0]}"\n`;
            });

            filename = `bulk_orders_${Date.now()}.csv`;
        }
        else if (type === 'deliveries') {
            let query = { businessId: req.user.businessId };
            if (startDate || endDate) {
                query.deliveryDate = {};
                if (startDate) query.deliveryDate.$gte = new Date(startDate);
                if (endDate) query.deliveryDate.$lte = new Date(endDate);
            }

            const deliveries = await DailyDelivery.find(query).populate('customerId', 'name phone');

            csvData = 'Customer Name,Phone,Delivery Date,Quantity,Amount Billed,Paid Amount,Payment Status\n';
            deliveries.forEach(d => {
                csvData += `"${d.customerId?.name || 'N/A'}","${d.customerId?.phone || 'N/A'}","${d.deliveryDate.toISOString().split('T')[0]}",${d.quantityDelivered},${d.amountBilled},${d.paidAmount},"${d.isPaid ? 'Paid' : 'Pending'}"\n`;
            });

            filename = `deliveries_${Date.now()}.csv`;
        }
        else {
            return res.status(400).json({
                success: false,
                message: 'Invalid report type'
            });
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(200).send(csvData);

    } catch (error) {
        next(error);
    }
};
