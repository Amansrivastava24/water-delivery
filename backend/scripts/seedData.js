require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const DailyCustomer = require('../models/DailyCustomer');
const DailyDelivery = require('../models/DailyDelivery');
const BulkOrder = require('../models/BulkOrder');

/**
 * Seed Script
 * Populates the database with sample data for testing
 */

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

const seedData = async () => {
    try {
        console.log('\n🌱 Starting database seeding...\n');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await DailyCustomer.deleteMany({});
        await DailyDelivery.deleteMany({});
        await BulkOrder.deleteMany({});

        // Create users
        console.log('👤 Creating users...');
        const users = await User.create([
            {
                email: 'admin@waterdelivery.com',
                name: 'Admin User',
                phone: '9876543210',
                role: 'admin',
                businessId: 'default-business'
            },
            {
                email: 'worker@waterdelivery.com',
                name: 'Delivery Worker',
                phone: '9876543211',
                role: 'worker',
                businessId: 'default-business'
            }
        ]);
        console.log(`✅ Created ${users.length} users`);

        // Create daily customers
        console.log('👥 Creating daily customers...');
        const customers = await DailyCustomer.create([
            {
                name: 'Rajesh Kumar',
                address: '123 MG Road, Bangalore',
                phone: '9876501234',
                bottleType: '20L',
                pricePerBottle: 50,
                isActive: true,
                businessId: 'default-business'
            },
            {
                name: 'Priya Sharma',
                address: '456 Brigade Road, Bangalore',
                phone: '9876501235',
                bottleType: '20L',
                pricePerBottle: 50,
                isActive: true,
                businessId: 'default-business'
            },
            {
                name: 'Amit Patel',
                address: '789 Indiranagar, Bangalore',
                phone: '9876501236',
                bottleType: '10L',
                pricePerBottle: 30,
                isActive: true,
                businessId: 'default-business'
            },
            {
                name: 'Sneha Reddy',
                address: '321 Koramangala, Bangalore',
                phone: '9876501237',
                bottleType: '20L',
                pricePerBottle: 50,
                isActive: true,
                businessId: 'default-business'
            },
            {
                name: 'Vikram Singh',
                address: '654 Whitefield, Bangalore',
                phone: '9876501238',
                bottleType: '20L',
                pricePerBottle: 50,
                isActive: true,
                businessId: 'default-business'
            },
            {
                name: 'Anita Desai',
                address: '987 Jayanagar, Bangalore',
                phone: '9876501239',
                bottleType: '10L',
                pricePerBottle: 30,
                isActive: true,
                businessId: 'default-business'
            },
            {
                name: 'Rahul Mehta',
                address: '147 HSR Layout, Bangalore',
                phone: '9876501240',
                bottleType: '20L',
                pricePerBottle: 50,
                isActive: true,
                businessId: 'default-business'
            },
            {
                name: 'Kavita Nair',
                address: '258 Malleshwaram, Bangalore',
                phone: '9876501241',
                bottleType: '20L',
                pricePerBottle: 50,
                isActive: false,
                businessId: 'default-business'
            },
            {
                name: 'Suresh Iyer',
                address: '369 BTM Layout, Bangalore',
                phone: '9876501242',
                bottleType: '10L',
                pricePerBottle: 30,
                isActive: true,
                businessId: 'default-business'
            },
            {
                name: 'Deepa Krishnan',
                address: '741 Electronic City, Bangalore',
                phone: '9876501243',
                bottleType: '20L',
                pricePerBottle: 50,
                isActive: true,
                businessId: 'default-business'
            }
        ]);
        console.log(`✅ Created ${customers.length} daily customers`);

        // Create deliveries for the last 30 days
        console.log('🚚 Creating delivery records...');
        const deliveries = [];
        const today = new Date();

        for (let i = 0; i < 30; i++) {
            const deliveryDate = new Date(today);
            deliveryDate.setDate(deliveryDate.getDate() - i);

            // Random deliveries for some customers each day
            const numDeliveries = Math.floor(Math.random() * 5) + 3; // 3-7 deliveries per day

            for (let j = 0; j < numDeliveries; j++) {
                const customer = customers[Math.floor(Math.random() * customers.length)];
                const quantity = Math.random() > 0.7 ? 2 : 1; // Sometimes 2 bottles
                const amountBilled = customer.pricePerBottle * quantity;
                const isPaid = Math.random() > 0.3; // 70% paid

                deliveries.push({
                    customerId: customer._id,
                    deliveryDate,
                    quantityDelivered: quantity,
                    amountBilled,
                    isPaid,
                    paidAmount: isPaid ? amountBilled : 0,
                    deliveredBy: users[1]._id,
                    businessId: 'default-business'
                });
            }
        }

        await DailyDelivery.insertMany(deliveries);
        console.log(`✅ Created ${deliveries.length} delivery records`);

        // Update customer totals based on deliveries
        console.log('💰 Updating customer payment totals...');
        for (const customer of customers) {
            const customerDeliveries = deliveries.filter(d =>
                d.customerId.toString() === customer._id.toString()
            );

            customer.totalBilled = customerDeliveries.reduce((sum, d) => sum + d.amountBilled, 0);
            customer.totalPaid = customerDeliveries.reduce((sum, d) => sum + d.paidAmount, 0);
            customer.pendingBalance = customer.totalBilled - customer.totalPaid;

            await customer.save();
        }
        console.log('✅ Updated customer payment totals');

        // Create bulk orders
        console.log('📦 Creating bulk orders...');
        const bulkOrders = await BulkOrder.create([
            {
                customerName: 'Ramesh Wedding Hall',
                phone: '9876600001',
                address: 'Palace Grounds, Bangalore',
                eventType: 'wedding',
                deliveryDates: [new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)],
                quantity: 100,
                bottleType: '20L',
                pricePerBottle: 45,
                totalAmount: 4500,
                paidAmount: 2250,
                businessId: 'default-business',
                createdBy: users[0]._id
            },
            {
                customerName: 'Tech Corp Annual Meet',
                phone: '9876600002',
                address: 'KTPO Convention Center, Bangalore',
                eventType: 'corporate',
                deliveryDates: [new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000)],
                quantity: 50,
                bottleType: '20L',
                pricePerBottle: 45,
                totalAmount: 2250,
                paidAmount: 2250,
                businessId: 'default-business',
                createdBy: users[0]._id
            },
            {
                customerName: 'Ganesh Festival Committee',
                phone: '9876600003',
                address: 'Basavanagudi, Bangalore',
                eventType: 'festival',
                deliveryDates: [
                    new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
                    new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000)
                ],
                quantity: 75,
                bottleType: '20L',
                pricePerBottle: 45,
                totalAmount: 3375,
                paidAmount: 3375,
                businessId: 'default-business',
                createdBy: users[0]._id
            },
            {
                customerName: 'Birthday Party - Sharma Residence',
                phone: '9876600004',
                address: 'JP Nagar, Bangalore',
                eventType: 'party',
                deliveryDates: [new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)],
                quantity: 20,
                bottleType: '20L',
                pricePerBottle: 50,
                totalAmount: 1000,
                paidAmount: 0,
                businessId: 'default-business',
                createdBy: users[0]._id
            },
            {
                customerName: 'Community Sports Event',
                phone: '9876600005',
                address: 'Cubbon Park, Bangalore',
                eventType: 'other',
                deliveryDates: [new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)],
                quantity: 30,
                bottleType: '10L',
                pricePerBottle: 28,
                totalAmount: 840,
                paidAmount: 420,
                businessId: 'default-business',
                createdBy: users[0]._id
            }
        ]);
        console.log(`✅ Created ${bulkOrders.length} bulk orders`);

        console.log('\n✅ Database seeding completed successfully!\n');
        console.log('📧 Test Users:');
        console.log('   Admin: admin@waterdelivery.com');
        console.log('   Worker: worker@waterdelivery.com');
        console.log('\n💡 Use OTP login - check console for OTP code\n');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
};

// Run seeding
connectDB().then(seedData);
