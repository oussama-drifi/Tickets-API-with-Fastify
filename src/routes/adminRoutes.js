import * as adminController from '../controllers/adminController.js';
import * as cardCategoryController from '../controllers/cardCategoryController.js';
import * as cardController from '../controllers/cardController.js';
import * as paymentController from '../controllers/paymentController.js'

export default async function adminRoutes(fastify) {
    // This hook runs for EVERY route in this file
    fastify.addHook('preHandler', async (request, reply) => {
        await fastify.authenticate(request, reply);
        await fastify.isAdmin(request, reply);
    });

    // Commercial routes
    fastify.get('/commercials', adminController.getAllCommercials);
    fastify.get('/commercials/search', adminController.searchCommercials);
    fastify.get('/commercials/:id', adminController.getCommercialById);
    fastify.get('/commercials/:id/tickets', adminController.getCommercialTickets);
    fastify.post('/commercials', adminController.createCommercial);
    fastify.patch('/commercials/:id', adminController.updateCommercial);

    // Card category routes
    fastify.post('/card-categories', cardCategoryController.createCardCategory);
    fastify.patch('/card-categories/:id', cardCategoryController.updateCardCategory);
    fastify.delete('/card-categories/:id', cardCategoryController.deleteCardCategory);
    fastify.get('/card-categories', cardCategoryController.listCardCategories)

    // Card routes
    fastify.post('/cards', cardController.createCard);
    fastify.patch('/cards/:id/status', cardController.updateCardStatus);
    fastify.patch('/cards/:id/balance', cardController.topUpCard);
    fastify.get('/cards', cardController.getAllCards);

    // Ticket routes
    fastify.get('/tickets', adminController.getAllTickets);
    fastify.get('/tickets/:id/image', adminController.getTicketImage);
    fastify.patch('/tickets/:id/status', adminController.updateTicketStatus);

    // Payment routes
    fastify.get('/payments', paymentController.getAllPayments)
    fastify.patch('/payments/:id/approve', paymentController.approvePayment)
    fastify.delete('/payments/:id', paymentController.cancelPayment)
    fastify.patch('/payments/:id', paymentController.approvePayment)
}