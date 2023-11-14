// import './__mocks__/stripe.mock'

import { AppException } from '@/common'
import { createMock } from '@golevelup/ts-jest'
import { Test, TestingModule } from '@nestjs/testing'
import { randomUUID } from 'crypto'
import Stripe from 'stripe'
import { STRIPE_ERROR } from '../stripe.exception'
import { STRIPE_OPTIONS_TOKEN } from '../stripe.interface'
import { StripeService } from '../stripe.service'

describe(`StripeService`, () => {
  let service: StripeService

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        StripeService,
        {
          provide: STRIPE_OPTIONS_TOKEN,
          useFactory: () => ({
            apiKey: process.env.STRIPE_API_KEY,
            options: { apiVersion: '2023-10-16' },
          }),
        },
      ],
    })
      .useMocker(createMock)
      .compile()
    service = module.get(StripeService)
  })
  beforeEach(() => {
    jest.resetModules()
  })
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  it(`Should be defined`, () => {
    expect(service).toBeDefined()
    expect(service['stripe']).toBeDefined()
  })

  const lastResponse = {
    headers: {},
    requestId: '1',
    statusCode: 201,
  }

  describe(`createCustomer`, () => {
    const req: Stripe.CustomerCreateParams = {}
    const res: Stripe.Response<Stripe.Customer> = {
      object: 'customer',
      id: `cus_${randomUUID()}`,
      email: req.email ?? null,
      balance: req.balance ?? null,
      description: req.description ?? null,
      created: Date.now(),
      default_source: null,
      livemode: false,
      shipping: null,
      metadata: {},
      invoice_settings: {
        custom_fields: null,
        default_payment_method: null,
        footer: null,
        rendering_options: null,
      },
      lastResponse,
    }
    it(`should call stripe customer create then return result`, async () => {
      jest.spyOn(service['stripe'].customers, 'create').mockResolvedValue(res)
      const response = await service.createCustomer(req)

      expect(service['stripe'].customers.create).toHaveBeenCalled()
      expect(service['stripe'].customers.create).toHaveBeenCalledTimes(1)
      expect(service['stripe'].customers.create).toHaveBeenCalledWith(req)
      expect(response).toEqual(res)
    })

    it(`should throw CREATE_CUSTOMER_FAILED with code: 800 if stripe create failed`, async () => {
      jest.spyOn(service['stripe'].customers, 'create').mockRejectedValue(new Error('Stripe Create Customer failed'))
      expect.assertions(5)
      try {
        await service.createCustomer(req)
      } catch (error) {
        expect(service['stripe'].customers.create).toHaveBeenCalled()
        expect(service['stripe'].customers.create).toHaveBeenCalledTimes(1)
        expect(service['stripe'].customers.create).toHaveBeenCalledWith(req)
        expect(error).toBeInstanceOf(AppException)
        expect(error.error).toMatchObject(STRIPE_ERROR.CREATE_CUSTOMER_FAILED)
      }
    })
  })

  describe(`createPaymentIntent`, () => {
    const req: Stripe.PaymentIntentCreateParams = {
      amount: 100,
      currency: 'USD',
    }
    const res: Stripe.Response<Stripe.PaymentIntent> = {
      object: 'payment_intent',
      id: `pi_${randomUUID()}`,
      amount: req.amount,
      amount_received: 0,
      amount_capturable: 1,
      currency: req.currency,
      application: null,
      application_fee_amount: req.application_fee_amount ?? null,
      automatic_payment_methods: req.automatic_payment_methods ?? { allow_redirects: 'always', enabled: true },
      canceled_at: null,
      cancellation_reason: null,
      capture_method: req.capture_method ?? null,
      client_secret: `pi_${randomUUID()}_{secret}`,
      confirmation_method: req.confirmation_method ?? 'automatic',
      created: Date.now(),
      customer: req.customer ?? null,
      description: req.description ?? null,
      invoice: null,
      last_payment_error: null,
      latest_charge: null,
      livemode: false,
      metadata: {},
      next_action: null,
      on_behalf_of: null,
      payment_method: req.payment_method,
      payment_method_types: req.payment_method_types,
      payment_method_options: {},
      processing: null,
      receipt_email: null,
      review: null,
      setup_future_usage: null,
      shipping: null,
      source: null,
      statement_descriptor: null,
      statement_descriptor_suffix: null,
      status: 'requires_payment_method',
      transfer_data: null,
      transfer_group: null,
      lastResponse,
    }
    it(`should call stripe payment intent create then return result`, async () => {
      jest.spyOn(service['stripe'].paymentIntents, 'create').mockResolvedValue(res)
      const response = await service.createPaymentIntent(req)

      expect(service['stripe'].paymentIntents.create).toHaveBeenCalled()
      expect(service['stripe'].paymentIntents.create).toHaveBeenCalledTimes(1)
      expect(service['stripe'].paymentIntents.create).toHaveBeenCalledWith(req)
      expect(response).toEqual(res)
    })

    it(`should throw CREATE_PAYMENT_FAILED with code: 801 if stripe create failed`, async () => {
      jest
        .spyOn(service['stripe'].paymentIntents, 'create')
        .mockRejectedValue(new Error('Stripe Create Payment Intents failed'))
      expect.assertions(5)
      try {
        await service.createPaymentIntent(req)
      } catch (error) {
        expect(service['stripe'].paymentIntents.create).toHaveBeenCalled()
        expect(service['stripe'].paymentIntents.create).toHaveBeenCalledTimes(1)
        expect(service['stripe'].paymentIntents.create).toHaveBeenCalledWith(req)
        expect(error).toBeInstanceOf(AppException)
        expect(error.error).toMatchObject(STRIPE_ERROR.CREATE_PAYMENT_FAILED)
      }
    })
  })
})
