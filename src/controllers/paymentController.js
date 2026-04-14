export const cancelPayment = async (request, reply) => {
    try {
        const { Payment, Card, Ticket } = request.server.db.models;
        const { id } = request.params;

        const payment = await Payment.findByPk(id);
        // handle edge cases
        if (!payment) return reply.code(404).send({ error: 'Payment not found' });
        if (['cancelled', 'failed'].includes(payment.status)) return reply.code(400).send({error : 'payment already canceled or failed'});

        payment.status = 'cancelled';

        if (payment.method === 'card') {
            const card = await Card.findByPk(payment.card_id);
            card.balance = parseFloat(card.balance) + parseFloat(payment.amount);
            await card.save();
        }

        const ticket = await Ticket.findByPk(payment.ticketId);
        if (ticket) {
            ticket.status = 'verified';
            await ticket.save();
        }

        await payment.save();

        return { message: 'payment canceled successfully' };
    } catch(error) {
        request.log.error(error)
        reply.code(500).send({error: 'server failed to cancel payment'})
    }
}

export const getAllPayments = async (request, reply) => {
    try {
        const { Payment, User, Card, CardCategory, Ticket } = request.server.db.models;

        const page = parseInt(request.query.page) || 1;
        const limit = parseInt(request.query.limit) || 10;
        const offset = (page - 1) * limit;
        const { Op } = request.server.db.sequelize.constructor;

        const where = {};
        // in case there is a search query
        if (request.query.label) where.label = { [Op.iLike]: `%${request.query.label}%` };

        const { count, rows: payments } = await Payment.findAndCountAll({
            where,
            attributes: { exclude: ['ticketId', 'userId', 'card_id'] },
            include: [
                { model: User, as: 'payer', attributes: ['id', 'name', 'email'] },
                { model: Ticket, as: 'ticket', attributes: ['id', 'title', 'amount', 'status'] },
                {
                    model: Card, as: 'card', attributes: ['id', 'balance', 'status'],
                    include: [{ model: CardCategory, as: 'category', attributes: ['id', 'name'] }]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        return {
            payments,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        };
    } catch(error) {
        request.log.error(error);
        reply.code(500).send({ error: 'Failed to get payments' });
    }
}

export const createPayment = async (request, reply) => {
    try {
        const { Payment, Card, Ticket } = request.server.db.models;
        const { ticket_id, method, card_id, payment_code, label } = request.body;

        // Validate required fields & handle edge cases
        if (!ticket_id || !method) return reply.code(400).send({ error: 'ticket_id and method are required' });
        if (!['card', 'cash'].includes(method)) return reply.code(400).send({ error: 'invalid payment method' });
        if (method === 'cash' && !payment_code) return reply.code(400).send({ error: 'payment_code is required for cash payments' });
        if (method === 'card' && !card_id) return reply.code(400).send({ error: 'card_id is required for card payments' });
        
        // Ticket must exist and be in 'verified' status to be payable
        const ticket = await Ticket.findByPk(ticket_id);
        if (!ticket) return reply.code(404).send({ error: 'Ticket not found' });
        if (ticket.status !== 'verified') return reply.code(400).send({ error: 'Ticket must be in verified status to be paid' });

        // Only the ticket's owner can pay it
        if (ticket.userId !== request.user.id) return reply.code(403).send({ error: 'You can only pay your own tickets' });

        if (method === 'card') {
            const card = await Card.findOne({ where: { id: card_id, userId: request.user.id } });
            if (!card) return reply.code(404).send({ error: 'Card not found' });
            if (card.status === 'blocked') return reply.code(400).send({ error: 'cannot pay with a blocked card' });

            const balance = parseFloat(card.balance);
            const amount = parseFloat(ticket.amount);
            if (balance < amount) return reply.code(400).send({ error: 'Insufficient card balance' });

            // Deduct balance, mark ticket paid, payment succeeds immediately
            card.balance = balance - amount;
            await card.save();

            ticket.status = 'paid';
            await ticket.save();

            const payment = await Payment.create({
                amount: ticket.amount,
                method: 'card',
                card_id: card.id,
                ticketId: ticket_id,
                userId: request.user.id,
                status: 'success',
                label: label || null
            });

            return reply.code(201).send({ message: 'Payment by card successful', id: payment.id });
        }

        // Cash payment — goes into review, no balance changes
        const payment = await Payment.create({
            amount: ticket.amount,
            method: 'cash',
            payment_code,
            ticketId: ticket_id,
            userId: request.user.id,
            status: 'in_review',
            label: label || null
        });

        return reply.code(201).send({ message: 'Payment submitted for review', id: payment.id });
    } catch (error) {
        request.log.error(error);
        reply.code(500).send({ error: 'Failed to create payment' });
    }
}

export const getMyPayments = async (request, reply) => {
    try {
        const { Payment, Card, CardCategory, Ticket } = request.server.db.models;

        const payments = await Payment.findAll({
            where: { userId: request.user.id },
            attributes: { exclude: ['ticketId', 'userId', 'card_id'] },
            include: [
                { model: Ticket, as: 'ticket', attributes: ['id', 'title', 'amount', 'status'] },
                {
                    model: Card, as: 'card', attributes: ['id', 'balance', 'status'],
                    include: [{ model: CardCategory, as: 'category', attributes: ['id', 'name'] }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return { payments };
    } catch (error) {
        request.log.error(error);
        reply.code(500).send({ error: 'Failed to get payments' });
    }
}

export const rejectPayment = async (request, reply) => {
    try {
        const { Payment } = request.server.db.models;
        const { id } = request.params;

        const payment = await Payment.findByPk(id);
        if (!payment) return reply.code(404).send({ error: 'Payment not found' });
        if (payment.method !== 'cash') return reply.code(400).send({ error: 'Only cash payments can be rejected' });
        if (payment.status !== 'in_review') return reply.code(400).send({ error: 'Only in_review payments can be rejected' });

        payment.status = 'failed';
        await payment.save();

        return { message: 'Payment rejected successfully' };
    } catch (error) {
        request.log.error(error);
        reply.code(500).send({ error: 'Failed to reject payment' });
    }
}

export const approvePayment = async (request, reply) => {
    try {
        const { Payment, Ticket } = request.server.db.models;
        const { id } = request.params;

        const payment = await Payment.findByPk(id);
        // handle edge cases
        if (!payment) return reply.code(404).send({ error: 'Payment not found' });
        if (payment.method !== 'cash') return reply.code(400).send({ error: 'Only cash payments can be approved' });
        if (payment.status !== 'in_review') return reply.code(400).send({ error: 'Only in_review payments can be approved' });

        const ticket = await Ticket.findByPk(payment.ticketId);
        if (ticket) {
            ticket.status = 'paid';
            await ticket.save();
        }

        payment.status = 'success';
        await payment.save();

        return { message: 'Payment approved successfully' };
    } catch (error) {
        request.log.error(error);
        reply.code(500).send({ error: 'Failed to approve payment' });
    }
}