// We destructure CardCategory from the models registered in db.js
// request.server.db.models gives us access to all Sequelize models

export const createCardCategory = async (request, reply) => {
    try {
        const { CardCategory } = request.server.db.models;
        const { name } = request.body;

        // name is the only required field, so we validate it upfront
        if (!name || !name.trim()) {
            return reply.code(400).send({ error: 'name is required' });
        }

        // Check for duplicates — the model has a unique constraint on name,
        // but we return a clean 409 instead of letting Sequelize throw a raw DB error
        const existing = await CardCategory.findOne({ where: { name: name.trim() } });
        if (existing) {
            return reply.code(409).send({ error: 'Card category already exists' });
        }

        const category = await CardCategory.create({ name: name.trim() });

        return reply.code(201).send({ message: 'Card category created', id: category.id });
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to create card category' });
    }
};

export const updateCardCategory = async (request, reply) => {
    try {
        const { CardCategory } = request.server.db.models;
        // :id comes from the URL param, name comes from the JSON body
        const { id } = request.params;
        const { name } = request.body;

        if (!name || !name.trim()) {
            return reply.code(400).send({ error: 'name is required' });
        }

        // findByPk = find by primary key (id), the most efficient lookup
        const category = await CardCategory.findByPk(id);
        if (!category) {
            return reply.code(404).send({ error: 'Card category not found' });
        }

        // Check the new name doesn't collide with another existing category
        const duplicate = await CardCategory.findOne({ where: { name: name.trim() } });
        if (duplicate && duplicate.id !== category.id) {
            return reply.code(409).send({ error: 'A category with that name already exists' });
        }

        category.name = name.trim();
        // .save() only issues an UPDATE for the fields that changed
        await category.save();

        return { message: 'Card category updated', category };
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to update card category' });
    }
};

export const deleteCardCategory = async (request, reply) => {
    try {
        const { CardCategory } = request.server.db.models;
        const { id } = request.params;

        const category = await CardCategory.findByPk(id);
        if (!category) {
            return reply.code(404).send({ error: 'Card category not found' });
        }

        // .destroy() issues a DELETE statement for this specific row
        await category.destroy();

        // 204 = No Content, standard for successful deletes with no response body
        return reply.code(204).send();
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to delete card category' });
    }
};

export const listCardCategories = async (request, reply) => {
    try {
        const { CardCategory } = request.server.db.models;

        // findAll with no where clause = fetch everything
        // ordered alphabetically by name for a clean list
        const categories = await CardCategory.findAll({
            order: [['name', 'ASC']]
        });

        return { categories };
    } catch (error) {
        request.log.error(error);
        return reply.code(500).send({ error: 'Failed to fetch card categories' });
    }
};
