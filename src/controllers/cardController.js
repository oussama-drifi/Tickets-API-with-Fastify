export const createCard = async (request, reply) => {
    try {
        const { Card, CardCategory, User } = request.server.db.models;
        const { user_id, category_id, balance } = request.body;

        // All three fields are required to create a card
        if (!user_id || !category_id || balance === undefined) {
            return reply.code(400).send({ error: 'missing information' });
        }

        // Make sure the target user exists and is a commercial — admin cards don't make sense
        const user = await User.findOne({ where: { id: user_id, role: 'commercial' } });
        if (!user) return reply.code(404).send({ error: 'Commercial user not found' });

        // Validate the category exists before assigning it
        const category = await CardCategory.findByPk(category_id);
        if (!category) return reply.code(404).send({ error: 'Card category not found' });

        // balance must be a non-negative number
        const parsedBalance = parseFloat(balance);
        if (isNaN(parsedBalance) || parsedBalance < 0) {
            return reply.code(400).send({ error: 'balance must be a non-negative number' });
        }

        const card = await Card.create({
            userId: user_id,
            categoryId: category_id,
            balance: parsedBalance
        });

        return reply.code(201).send({ message: 'Card created successfully', id: card.id });
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to create card' });
    }
};

export const updateCardStatus = async (request, reply) => {
    try {
        const { Card } = request.server.db.models;
        const { id } = request.params;
        const { status } = request.body;

        if (!['active', 'blocked'].includes(status)) {
            return reply.code(400).send({ error: 'status must be active or blocked' });
        }

        const card = await Card.findByPk(id);
        if (!card) return reply.code(404).send({ error: 'Card not found' });

        card.status = status;
        await card.save();

        return { message: `Card is now ${status}` };
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to update card status' });
    }
};

export const topUpCard = async (request, reply) => {
    try {
        const { Card } = request.server.db.models;
        const { id } = request.params;
        const { amount } = request.body;

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return reply.code(400).send({ error: 'amount must be a positive number' });
        }

        const card = await Card.findByPk(id);
        if (!card) return reply.code(404).send({ error: 'Card not found' });

        card.balance = parseFloat(card.balance) + parsedAmount;
        await card.save();

        return { message: 'Balance topped up successfully', balance: card.balance };
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to top up card' });
    }
};

export const getAllCards = async (request, reply) => {
    try {
        const { Card, CardCategory, User } = request.server.db.models;

        // Include category and owner so the admin sees full card info in one request
        const cards = await Card.findAll({
            include: [
                { model: CardCategory, as: 'category', attributes: ['id', 'name'] },
                { model: User, as: 'owner', attributes: ['id', 'name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        return { cards };
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to fetch cards' });
    }
};

export const getMyCards = async (request, reply) => {
    try {
        const { Card, CardCategory } = request.server.db.models;

        // request.user.id is set by the JWT authenticate hook — it's the logged-in commercial
        const cards = await Card.findAll({
            where: { userId: request.user.id },
            include: [
                { model: CardCategory, as: 'category', attributes: ['id', 'name'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        return { cards };
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to fetch cards' });
    }
};