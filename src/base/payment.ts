import axios from "axios";
import dotenv from "dotenv";
import extractNumbers from "../data/extractNumbers";
import { offer } from "../data/offerIds";
dotenv.config();

export default async function Payment(redis: any){
    const API_KEY = process.env.LAVA_API_KEY,
        LAVA_API_URL = 'https://gate.lava.top';

    class Payment {
        private GetPaymentMethod(typeOfPay: string): string[] {
            return typeOfPay === "Другие банки" ? [ 'USD', 'UNLIMINT' ] : [ 'RUB', 'BANK131' ]
        }

        async CreatePayment(userID: number, email: string, offerId: string, typeOfPay: string){
            const _offerId = offer[extractNumbers(offerId)],
                paymentMethod = this.GetPaymentMethod(typeOfPay);
            try {
                const response = await axios.post(`${LAVA_API_URL}/api/v2/invoice`, {
                    email: email,
                    offerId: _offerId,
                    currency: paymentMethod[0],
                    paymentMethod: paymentMethod[1]
                }, {
                    headers: {
                        "X-Api-Key": API_KEY,
                    }
                });
            
                await redis.set(userID)('active_payment_id')(response.data.id);
                console.log(response.data);
                return response.data.paymentUrl;
            } catch (error) {
                console.error("Error to create payment event: ", error);
                return error;
            }
        }

        async CheckPayment(paymentId: string){
            try {
                const response = await axios.get(`${LAVA_API_URL}/api/v1/invoice?id=${paymentId}`, {
                    headers: {
                    "X-Api-Key": API_KEY,
                    },
                });
            
                return [ response.data.status, response.data.amountTotal.amount ];
            } catch (error) {
                console.error("Error to check actual payment event: ", error);
                return "failed";
            }
        }
    }

    return new Payment()
}