import keyboards from "../keyboards";
import { Message } from "../../base/types";
import Payment from "../../base/payment";
import Subscription from "../../base/subscription";
import TimeSubscription from "../priceTime";
import priceList from "../priceList";
import EmailChecker from "../../base/emailHandler";

export default async function PaymentHandler(onTextMessage: Message, db: any) {
    
    onTextMessage('EmailRespond', async (ctx, user, set, data) => {
        if (await EmailChecker(ctx, data.text, user.email, db)){
            
            await set('email')(data.text.toLowerCase());
            
            ctx.reply("Отлично, нажмите <b><i>'Дальше'</i></b> для перехода к прайсу и последующей оплате", {
                reply_markup: {
                    keyboard: keyboards.next()
                }
            });

            await set('state')('PaymentRequest');
        }
    })

    onTextMessage('PaymentRequest', async (ctx, user, set, data) => {
        if (data.text === 'Дальше') {
            ctx.reply(priceList, {
                reply_markup: {
                    keyboard: keyboards.tarifs()
                }
            })

            await set('state')('PaymentTypeRequest');
        }
        else ctx.reply("Упс... это немного не то что мы ожидали, нажмите пожалуйста на кнопку ниже!", {
            reply_markup: {
                keyboard: keyboards.next()
            }
        })
    })

    onTextMessage('PaymentTypeRequest', async (ctx, user, set, data) => {
        if (["1 месяц", "6 месяцев", "Навсегда"].includes(data.text)){
            await set('tarifChoosed')(data.text);

            ctx.reply("Чудесно! Теперь, пожалуйста, выбирите банк, который наиболее соотвествует вашей карте оплаты", {
                reply_markup: {
                    keyboard: keyboards.typeOfPay()
                }
            })
            
            await set('state')('PaymentHandler');
        }
        else ctx.reply("Извините, но вам нужно выбрать один из предложенных вариантов подписки", {
            reply_markup: {
                keyboard: keyboards.tarifs()
            }
        })
    })

    onTextMessage('PaymentHandler', async (ctx, user, set, data) => {
        if (data.text === 'Другие банки' || data.text === 'Банки для РФ'){
            const load_mess = await ctx.reply("Загрузка, пожалуйста, подождите...");
            
            const pay = await Payment(db),
                payment = await pay.CreatePayment(ctx?.chat?.id ?? -1, user.email, user.tarifChoosed, data.text);

            
            await ctx.reply("Нажмите на 'Оплатить', чтобы оплатить выбранную вами подписку", {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Оплатить', web_app: { url: payment } }]
                    ]
                }
            })

            await ctx.deleteMessage(load_mess.message_id);

            await ctx.reply("После оплаты, пожалуйста, нажмите на кнопку проверки оплаты", {
                reply_markup: {
                    keyboard: keyboards.checkPayment()
                }
            })

            await set('state')('CheckPayment');
        }
        else ctx.reply("Извините, но вам нужно выбрать одну из предложеных кнопок ниже", {
            reply_markup: {
                keyboard: keyboards.typeOfPay()
            }
        });
    })

    onTextMessage('CheckPayment', async (ctx, user, set, data) => {
        if (data.text === 'Проверить оплату') {
            const pay = await Payment(db),
                subs = await Subscription(db),
                status = await pay.CheckPayment(user['active_payment_id']);

            switch (status[0]){
                case "in-progress":
                    ctx.reply("Вам нужно оплатить вашу покупку перед тем как продолжить, нажмите кнопку оплатить выше", {
                        reply_markup: {
                            keyboard: keyboards.checkPayment()
                        }
                    });
                    break;

                case "failed":
                    ctx.reply("Оплата не прошла либо случилась непредвиденная ошибка, обратитесь, пожалуйста, в поддержку или попробуйте позже", {
                        reply_markup: {
                            keyboard: keyboards.checkPayment()
                        }
                    })
                    break;

                case "success":
                    try{
                        await ctx.deleteMessage(parseInt(user.linkMessage));
                    } catch (e){
                        console.log(`Link message deleting error: ${e}`);
                    }

                    const user_subs = user.subs && user.subs !== '' && user.subs !== 'unlimit' ? new Date(user.subs) : false,
                        expiredAt = 
                            user_subs 
                            ? 
                            ( TimeSubscription(status[1]) === 'unlimit' ? 'unlimit' : user_subs.setMonth(user_subs.getMonth() + TimeSubscription(status[1], true)) )
                            : 
                            TimeSubscription(status[1]);

                    await subs.SetSubscription(ctx?.chat?.id ?? -1, expiredAt);
                    await ctx.reply("Оплата прошла успешно, спасибо Вам за покупку!");
                    const inviteLink = await ctx.telegram.createChatInviteLink(process.env.PRIVATE_TELEGRAM_CHANNEL ?? '', {
                        name: 'one-time-invite',
                        member_limit: 1,
                    });
                    const linkMessage = await ctx.reply("Добро пожаловать в мой закрытый мир🔞\nНаслыждайся🤤", {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: 'Перейти по ссылке', url: inviteLink.invite_link }]
                            ]
                        }
                    })
                    await set('linkMessage')(linkMessage.message_id.toString());
                    break;

                default:
                    throw new Error('Uncorrect payment status (check lava top docs)');
            }
        }
    })
}