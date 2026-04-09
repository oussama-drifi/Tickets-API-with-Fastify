import * as commercialController from '../controllers/commercialController.js';
import * as cardController from '../controllers/cardController.js';
import * as paymentController from '../controllers/paymentController.js'
import * as cardCategoryController from '../controllers/cardCategoryController.js'

export default async function commercialRoutes(fastify) {
    fastify.addHook('preHandler', async (request, reply) => {
        await fastify.authenticate(request, reply);
    });

    fastify.patch('/profile', commercialController.updateMyProfile);
    fastify.get('/tickets', commercialController.getMyTickets);
    fastify.get('/tickets/:id/image', commercialController.getMyTicketImage);
    fastify.post('/tickets', commercialController.createTicket);

    fastify.get('/card-categories', cardCategoryController.listCardCategories)
    fastify.get('/cards', cardController.getMyCards);

    fastify.get('/payments', paymentController.getMyPayments);
    fastify.post('/payments', paymentController.createPayment)
}