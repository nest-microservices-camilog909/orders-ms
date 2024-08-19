import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateOrderDto, OrderPaginationDto, StatusOrderDto } from './dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
	private readonly logger = new Logger('OrdersService');

	async onModuleInit() {
		await this.$connect();
		this.logger.log('Database is connected.');
	}

	async findAll(pagination: OrderPaginationDto) {
		const { page, limit, status } = pagination;

		const totalRows = await this.order.count({
			where: {
				status,
			},
		});

		return {
			data: await this.order.findMany({
				skip: (page - 1) * limit,
				take: limit,
				where: {
					status,
				},
			}),
			currentPage: page,
			total: totalRows,
			totalPages: Math.ceil(totalRows / limit),
		};
	}

	async findOne(id: string) {
		const order = await this.order.findUnique({
			where: {
				id,
			},
		});

		if (!order) {
			throw new RpcException({
				status: HttpStatus.NOT_FOUND,
				message: 'Product not found',
			});
		}

		return order;
	}

	create(createOrderDto: CreateOrderDto) {
		return this.order.create({
			data: createOrderDto,
		});
	}

	async changeStatus(request: StatusOrderDto) {
		await this.findOne(request.id);

		return this.order.update({
			data: {
				status: request.status,
			},
			where: {
				id: request.id,
			},
		});
	}
}
