import {
	HttpStatus,
	Inject,
	Injectable,
	Logger,
	OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateOrderDto, OrderPaginationDto, StatusOrderDto } from './dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
	private readonly logger = new Logger('OrdersService');

	constructor(
		@Inject('PRODUCTS_SERVICE')
		private readonly productsClient: ClientProxy,
	) {
		super();
	}

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
			include: {
				OrderItem: {
					select: {
						price: true,
						quantity: true,
						productId: true,
					},
				},
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

	async create(createOrderDto: CreateOrderDto) {
		try {
			// VALIDATE IF EXISTS IN DB PRODUCTS
			const products: any[] = await firstValueFrom(
				this.productsClient.send(
					{ cmd: 'validate_products' },
					createOrderDto.items.map((i) => i.productId),
				),
			);

			const totalAmount = createOrderDto.items.reduce((acc, item) => {
				const price = products.find((i) => i.id === item.productId)?.price;
				return acc + price * item.quantity;
			}, 0);

			const totalItems = createOrderDto.items.reduce((acc, item) => {
				return acc + item.quantity;
			}, 0);

			const order = await this.order.create({
				data: {
					totalAmount,
					totalItems,
					OrderItem: {
						createMany: {
							data: createOrderDto.items.map((item) => ({
								price:
									products.find((i) => i.id === item.productId).price ??
									item.price,
								productId: item.productId,
								quantity: item.quantity,
							})),
						},
					},
				},
				include: {
					OrderItem: {
						select: {
							price: true,
							quantity: true,
							productId: true,
						},
					},
				},
			});

			return order;
		} catch (e) {
			throw new RpcException(e);
		}
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
