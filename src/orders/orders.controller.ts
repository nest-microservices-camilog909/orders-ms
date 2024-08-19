import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto, OrderPaginationDto, StatusOrderDto } from './dto';

@Controller()
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@MessagePattern('create')
	create(@Payload() createOrderDto: CreateOrderDto) {
		return this.ordersService.create(createOrderDto);
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
}
