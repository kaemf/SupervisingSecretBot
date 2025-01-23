import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export default async function Payment(redis: any){
    const API_KEY = process.env.LAVA_API_KEY,
        LAVA_API_URL = 'https://gate.lava.top';

    class Payment {
        async CreatePayment(userID: number, email: string, offerId?: string){
            try {
                const response = await axios.post(`${LAVA_API_URL}/api/v2/invoice`, {
                    email: email,
                    offerId: "48f8b2f7-fe4b-4145-b01f-1fdd4b0833d5",
                    currency: "RUB",
                    paymentMethod: "BANK131"
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
            
                return response.data.status; // Возвращает статус платежа
              } catch (error) {
                console.error("Error to check actual payment event: ", error);
                return "failed";
              }
        }
    }

    return new Payment()
}