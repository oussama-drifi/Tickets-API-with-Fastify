import * as adminController from '../controllers/adminController.js';
import * as cardCategoryController from '../controllers/cardCategoryController.js';

export default async function adminRoutes(fastify) {
    // This hook runs for EVERY route in this file
    fastify.addHook('preHandler', async (request, reply) => {
        await fastify.authenticate(request, reply);
        await fastify.isAdmin(request, reply);
    });

    fastify.get('/commercials', adminController.getAllCommercials);
    fastify.get('/commercials/search', adminController.searchCommercials);
    fastify.get('/commercials/:id', adminController.getCommercialById);
    fastify.get('/commercials/:id/tickets', adminController.getCommercialTickets);
    fastify.post('/commercials', adminController.createCommercial);
    fastify.patch('/commercials/:id', adminController.updateCommercial);

    // Card category routes — admin only (create, update, delete)
    fastify.post('/card-categories', cardCategoryController.createCardCategory);
    fastify.patch('/card-categories/:id', cardCategoryController.updateCardCategory);
    fastify.delete('/card-categories/:id', cardCategoryController.deleteCardCategory);

    fastify.get('/tickets', adminController.getAllTickets);
    fastify.get('/tickets/:id/image', adminController.getTicketImage);
    fastify.patch('/tickets/:id/status', adminController.updateTicketStatus);
}