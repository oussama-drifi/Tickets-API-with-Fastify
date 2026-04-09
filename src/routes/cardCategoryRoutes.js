import * as cardCategoryController from '../controllers/cardCategoryController.js';

export default async function cardCategoryRoutes(fastify) {
    fastify.addHook('preHandler', async (request, reply) => {
        await fastify.authenticate(request, reply);
    });

    fastify.get('/', cardCategoryController.listCardCategories);
}