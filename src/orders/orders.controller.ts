import { Controller } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto, OrderPaginationDto, StatusOrderDto } from './dto';
import { PaidOrderDto } from './dto/paid-order.dto';

@Controller()
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@MessagePattern('create')
	async create(@Payload() createOrderDto: CreateOrderDto) {
		const order = await this.ordersService.create(createOrderDto);
		const paymentSession = await this.ordersService.createPaymentSession(order);

		return {
			order,
			paymentSession,
		};
	}

	@MessagePattern('findAll')
	findAll(@Payload() pagination: OrderPaginationDto) {
		return this.ordersService.findAll(pagination);
	}

	@MessagePattern('findOne')
	findOne(@Payload('id') id: string) {
		return this.ordersService.findOne(id);
	}

	@MessagePattern('changeStatus')
	changeStatus(@Payload() request: StatusOrderDto) {
		return this.ordersService.changeStatus(request);
	}

	// SE PUEDEN USAR LOS DOS
	// @MessagePattern('payment.succeeded')
	@EventPattern('payment.succeeded')
	orderPaid(@Payload() request: PaidOrderDto) {
		return this.ordersService.paidOrder(request);
	}
}
