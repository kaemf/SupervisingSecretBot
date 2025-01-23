import { Telegram } from "telegraf";
import dotenv from "dotenv";

dotenv.config();

export default async function Subscription(redis: any){
    class Subscription {
        async CheckSubscription(userID: number){
            const subs = await redis.get(userID)('subs');

            if (subs && new Date(subs) < new Date()){
                await redis.set(userID)('subs')('');
                return false;
            }

            if (subs && new Date(subs) > new Date()){
                return true;
            }
            else return false;
        }

        async SetSubscription(userID: number, dateExpired: Date){
            await redis.set(userID)('subs')(dateExpired);
        }

        async DeleteSubscription(userID: number){
            await redis.set(userID)('subs')('');
        }
    }

    return new Subscription;
}

export async function RegularCheckSubscription(ctx: Telegram,  redis: any){
    const subs = await Subscription(redis);
    
    setInterval(async () => {
        const users = await redis.getAllKeys();

        for (let i = 0; i < users.length; i++){
            if (!await subs.CheckSubscription(users[i])){
                await subs.DeleteSubscription(users[i]);
                try {
                    const member = await ctx.getChatMember(process.env.PRIVATE_TELEGRAM_CHANNEL ?? '', users[i]);
    
                    if ('member'.includes(member.status)) {
                        await ctx.kickChatMember(process.env.PRIVATE_TELEGRAM_CHANNEL ?? '', users[i]);
                        const linkMessage = await redis.get(users[i])('linkMessage');

                        try{
                            await ctx.deleteMessage(users[i], parseInt(linkMessage))
                        } catch (e: any) {
                            console.error(`Link message to delete not found for user ${users[i]}:`, e);
                        }

                        console.log(`User (${users[i]}) has been kicked from the channel 'cause his subscription has expired.`);
                    }
                } catch (e: any) {
                    if (e.response && e.response.error_code === 400) {
                        // User not found in the channel
                    } else {
                        console.error(`Error while checking user ${users[i]}:`, e);
                    }
                }
            }
        }
    }, 24 * 60 * 60 * 1000)

}