import { IsEnum, IsUUID } from 'class-validator';
import { OrderStatusList } from '../enum/order.enum';
import { OrderStatus } from '@prisma/client';

export class StatusOrderDto {
	@IsUUID()
	public id: string;
	@IsEnum(OrderStatusList, {
		message: 'Invalid status',
	})
	public status: OrderStatus;
}
