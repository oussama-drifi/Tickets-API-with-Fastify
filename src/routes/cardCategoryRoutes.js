import * as cardCategoryController from '../controllers/cardCategoryController.js';

export default async function cardCategoryRoutes(fastify) {
    // This hook runs for every route in this file
    // authenticate checks the JWT is valid — that's all we need here (admin or commercial)
    fastify.addHook('preHandler', async (request, reply) => {
        await fastify.authenticate(request, reply);
    });

    fastify.get('/', cardCategoryController.listCardCategories);
}