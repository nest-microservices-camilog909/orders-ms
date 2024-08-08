import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller()
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@MessagePattern('create')
	create(@Payload() createOrderDto: CreateOrderDto) {
		return this.ordersService.create(createOrderDto);
	}

	@MessagePattern('findAll')
	findAll() {
		return this.ordersService.findAll();
	}

	@MessagePattern('findOne')
	findOne(@Payload() id: number) {
		return this.ordersService.findOne(id);
	}

	@MessagePattern('changeStatus')
	changeStatus(@Payload() id: number) {
		return this.ordersService.changeStatus(id);
	}
}
