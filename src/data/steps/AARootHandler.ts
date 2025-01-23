import { Context, Telegraf } from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram"
import keyboards from "../keyboards";
import { Message } from "../../base/types";
import { CheckException } from "../../base/check";
import Payment from "../../base/payment";
import Subscription from "../../base/subscription";

export default async function AARootHandler(onTextMessage: Message, db: any) {
    onTextMessage('AARoot', async (ctx, user, set, data) => {
        switch (data.text){
            case "Изменить почту":
                ctx.reply(`Ваш актуальный адрес электронной почты - ${user.email}\n\nВведите /status для отмены либо Введите новый адрес электронной почты`);
                await set('state')('EmailChangeHandler');
                break;

            case "Перейти к оплате":
                const pay = await Payment(db),
                    payment = await pay.CreatePayment(ctx?.chat?.id ?? -1, user.email);
                
                await ctx.reply("Оплата", {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Оплатить', web_app: { url: payment } }]
                        ]
                    }
                })
    
                await ctx.reply("После оплаты, пожалуйста, нажмите на кнопку проверки оплаты", {
                    reply_markup: {
                        one_time_keyboard: true,
                        resize_keyboard: true,
                        keyboard: keyboards.checkPayment()
                    }
                })
    
                await set('state')('CheckPayment');
                break;

            default: 
                ctx.reply("Извините, но вам нужно выбрать одну из кнопок ниже")
                break;
        }
    })

    onTextMessage('EmailChangeHandler', async (ctx, user, set, data) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (CheckException.TextException(data) && emailRegex.test(data.text.toLowerCase())){
                    
            await set('email')(data.text.toLowerCase());
            
            ctx.reply("Ваш адрес электронной почты успешно изменен!\nДля просмотра статуса подписки - /status");
        }
        else ctx.reply("Извините, но это мало похоже на электронную почту, попрошу вас ввести еще раз");
    })
}